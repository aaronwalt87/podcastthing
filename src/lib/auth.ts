import crypto from 'crypto'

export const COOKIE_NAME = 'admin_token'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

// Derive the expected cookie token from ADMIN_PASSWORD.
// The token never contains the raw password — it's an HMAC-derived value.
export function computeToken(): string {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) throw new Error('ADMIN_PASSWORD is not set')
  return crypto.createHmac('sha256', pw).update('admin-session').digest('hex')
}

// Constant-time comparison to prevent timing attacks.
export function isValidToken(token: string): boolean {
  try {
    const expected = computeToken()
    const a = Buffer.from(token)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: COOKIE_MAX_AGE,
  path: '/',
}
