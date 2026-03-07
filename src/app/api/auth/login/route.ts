import { NextResponse } from 'next/server'
import { computeToken, COOKIE_NAME, cookieOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    const token = computeToken()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(COOKIE_NAME, token, cookieOptions)
    return response
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
