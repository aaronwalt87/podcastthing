export const COOKIE_NAME = 'admin_token'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

/**
 * Session tokens are `<expiresAt>.<hmac>`, where the HMAC is taken over the
 * expiry itself. That matters for two reasons:
 *
 *  - the token carries its own lifetime, so a copied cookie stops working
 *    without any server-side session store (cookie `maxAge` is only a hint the
 *    browser is free to ignore);
 *  - the signature changes every login, so a token is not a constant that can
 *    be derived offline from the password alone.
 *
 * Web Crypto is used so the same code runs in Edge middleware and Node routes.
 */

/** No password configured means no valid session — never a default one. */
export function isAuthConfigured(): boolean {
  return typeof process.env.ADMIN_PASSWORD === 'string' && process.env.ADMIN_PASSWORD.length > 0
}

async function getKey(): Promise<CryptoKey | null> {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return null

  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

async function sign(payload: string): Promise<string | null> {
  const key = await getKey()
  if (!key) return null

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Length-independent, constant-time comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function createSessionToken(now = Date.now()): Promise<string | null> {
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000
  const signature = await sign(`admin-session|${expiresAt}`)
  return signature ? `${expiresAt}.${signature}` : null
}

export async function verifySessionToken(token: string, now = Date.now()): Promise<boolean> {
  // Fail closed: an unconfigured password must not authorise anything.
  if (!isAuthConfigured() || !token) return false

  try {
    const separator = token.indexOf('.')
    if (separator <= 0) return false

    const expiresAtRaw = token.slice(0, separator)
    const signature = token.slice(separator + 1)

    const expiresAt = Number(expiresAtRaw)
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false

    const expected = await sign(`admin-session|${expiresAt}`)
    return expected !== null && safeEqual(signature, expected)
  } catch {
    return false
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: '/',
}
