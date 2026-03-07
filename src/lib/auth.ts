export const COOKIE_NAME = 'admin_token'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

// Uses Web Crypto API — works in both Edge runtime (middleware) and Node.js (API routes)

async function getKey(): Promise<CryptoKey> {
  const pw = process.env.ADMIN_PASSWORD || ''
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pw),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

export async function computeToken(): Promise<string> {
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('admin-session'))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Constant-time string comparison to prevent timing attacks
export async function isValidToken(token: string): Promise<boolean> {
  try {
    const expected = await computeToken()
    if (token.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < token.length; i++) {
      diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
    }
    return diff === 0
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
