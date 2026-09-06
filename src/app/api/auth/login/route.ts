import { NextResponse } from 'next/server'
import {
  COOKIE_NAME,
  cookieOptions,
  createSessionToken,
  isAuthConfigured,
  safeEqual,
} from '@/lib/auth'
import { getRedis, isRedisConfigured } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const WINDOW_SECONDS = 900 // 15 minutes
const MAX_ATTEMPTS = 10

/** Per-instance fallback when no store is configured. Survives a warm container. */
const memoryAttempts = new Map<string, { count: number; since: number }>()

/** SHA-256 hex, so the comparison below is over fixed-length strings. */
async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function clientKey(request: Request): string {
  // The platform header first, and never the LEFTMOST x-forwarded-for entry:
  // proxies append, so the leftmost value is whatever the client sent. Keying
  // on it lets an attacker mint a fresh counter per request — defeating the
  // limit entirely and inflating the Redis key count on the way.
  const ip =
    request.headers.get('x-real-ip') ||
    (request.headers.get('x-forwarded-for') ?? '').split(',').pop()?.trim() ||
    'unknown'
  return `auth:attempts:${ip}`
}

/**
 * Counts failed attempts per client.
 *
 * The two "no counter" cases are deliberately different:
 *
 *  - Redis is *configured but failing* — fail CLOSED. Unlimited guessing
 *    against one shared human-chosen password is worse than an admin waiting
 *    for the store to come back.
 *  - Redis is *not configured at all* — fall back to a per-instance counter
 *    rather than failing closed, which would permanently lock the owner out of
 *    a deployment that was never given credentials. This is not risk-free:
 *    /api/upload mints billable Blob tokens and needs no Redis, so a store-less
 *    deploy that still holds BLOB_READ_WRITE_TOKEN is worth guessing at. The
 *    in-memory counter bounds that within a warm container, which is the best
 *    available without a store.
 */
async function overLimit(key: string): Promise<boolean> {
  if (!isRedisConfigured()) {
    // Nothing to count with. Failing closed here would permanently lock the
    // owner out of a deployment that was never given credentials. Note this is
    // not risk-free: /api/upload mints billable Blob tokens and needs no Redis,
    // so a store-less deploy that still has BLOB_READ_WRITE_TOKEN is worth
    // guessing at. The in-memory counter below limits that within a warm
    // container, which is the best available without a store.
    const now = Date.now()

    // A cache with no eviction is a leak. Sweep expired entries once the map
    // grows past a size a real client population would not reach.
    if (memoryAttempts.size > 1000) {
      memoryAttempts.forEach((v, k) => {
        if (now - v.since >= WINDOW_SECONDS * 1000) memoryAttempts.delete(k)
      })
    }

    const seen = memoryAttempts.get(key)
    if (seen && now - seen.since < WINDOW_SECONDS * 1000) {
      seen.count += 1
      return seen.count > MAX_ATTEMPTS
    }
    memoryAttempts.set(key, { count: 1, since: now })
    return false
  }

  const redis = getRedis()
  if (!redis) return true

  try {
    const attempts = await redis.incr(key)
    if (attempts === 1) await redis.expire(key, WINDOW_SECONDS)
    return attempts > MAX_ATTEMPTS
  } catch (err) {
    console.error('[auth] rate-limit check failed', err)
    return true
  }
}

async function clearAttempts(key: string): Promise<void> {
  try {
    await getRedis()?.del(key)
  } catch {
    /* the counter expires on its own */
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthConfigured()) {
      console.error('POST /api/auth/login: ADMIN_PASSWORD is not set')
      return NextResponse.json({ error: 'Admin access is not configured' }, { status: 503 })
    }

    const key = clientKey(request)
    if (await overLimit(key)) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(WINDOW_SECONDS) } }
      )
    }

    const { password } = (await request.json()) as { password?: unknown }
    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    // Compare digests, not the raw strings: an early length check would leak
    // the password's length by timing.
    const [given, expected] = await Promise.all([
      digest(password),
      digest(process.env.ADMIN_PASSWORD as string),
    ])
    if (!safeEqual(given, expected)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const token = await createSessionToken()
    if (!token) {
      return NextResponse.json({ error: 'Admin access is not configured' }, { status: 503 })
    }

    await clearAttempts(key)

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, cookieOptions)
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
