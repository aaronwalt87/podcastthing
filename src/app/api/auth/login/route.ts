import { NextResponse } from 'next/server'
import { COOKIE_NAME, cookieOptions, createSessionToken, isAuthConfigured } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/** Constant-time comparison so a wrong password leaks nothing by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function POST(request: Request) {
  try {
    if (!isAuthConfigured()) {
      console.error('POST /api/auth/login: ADMIN_PASSWORD is not set')
      return NextResponse.json({ error: 'Admin access is not configured' }, { status: 503 })
    }

    const { password } = (await request.json()) as { password?: unknown }
    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    if (!safeEqual(password, process.env.ADMIN_PASSWORD as string)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const token = await createSessionToken()
    if (!token) {
      return NextResponse.json({ error: 'Admin access is not configured' }, { status: 503 })
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, cookieOptions)
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
