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

/** SHA-256 hex, so the comparison below is over fixed-length strings. */
async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwarded.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
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
 *  - Redis is *not configured at all* — allow. There is nothing to rate-limit
 *    with, the admin panel cannot write anything without a store anyway, and
 *    failing closed here would permanently lock the owner out of a deployment
 *    that was never given credentials.
 */
async function overLimit(key: string): Promise<boolean> {
  if (!isRedisConfigured()) {
    console.warn('[auth] no store configured — login attempts are not rate limited')
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
