export const COOKIE_NAME = 'admin_token'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

/**
 * Session tokens are `<expiresAt>.<hmac>`, where the HMAC covers the expiry.
 * The expiry travels inside the signed payload so a copied cookie stops working
 * without any server-side session store — a cookie's `maxAge` is only a hint
 * the browser is free to ignore.
 *
 * The signing key is NOT the admin password. Using the password directly would
 * make every issued cookie a known-plaintext/known-MAC pair against a
 * human-chosen secret — one HMAC per guess, billions per second on commodity
 * hardware — so a single leaked cookie would recover the password itself.
 * `SESSION_SECRET` is used when set; otherwise the password is stretched
 * through PBKDF2 so each guess costs ~100k iterations instead of one.
 *
 * Web Crypto throughout, so the same code runs in Edge middleware and Node
 * routes.
 */

const PBKDF2_ITERATIONS = 100_000
/** Fixed salt: the input is a single site-wide secret, not a user table. */
const PBKDF2_SALT = new TextEncoder().encode('signal.admin.session.v1')

/** No password configured means no valid session — never a default one. */
export function isAuthConfigured(): boolean {
  return typeof process.env.ADMIN_PASSWORD === 'string' && process.env.ADMIN_PASSWORD.length > 0
}

/** Constant-time comparison. Exported so the login route shares one copy. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

let cachedKey: CryptoKey | null = null

async function getKey(): Promise<CryptoKey | null> {
  if (cachedKey) return cachedKey

  const explicit = process.env.SESSION_SECRET
  if (explicit && explicit.length >= 16) {
    cachedKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(explicit),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    return cachedKey
  }

  const password = process.env.ADMIN_PASSWORD
  if (!password) return null

  // No dedicated secret: stretch the password rather than using it raw.
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  cachedKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: PBKDF2_SALT, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    false,
    ['sign']
  )
  return cachedKey
}

async function sign(payload: string): Promise<string | null> {
  const key = await getKey()
  if (!key) return null

  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
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

    const expiresAt = Number(token.slice(0, separator))
    if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false

    const expected = await sign(`admin-session|${expiresAt}`)
    return expected !== null && safeEqual(token.slice(separator + 1), expected)
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
