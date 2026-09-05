import { Redis } from '@upstash/redis'

/**
 * Upstash client, created lazily.
 *
 * The site is a public read-only surface for most visitors, so a missing or
 * misconfigured Redis must degrade to "no data" — never to a 500. Callers use
 * `getRedis()` and treat `null` as an empty store.
 */
let client: Redis | null = null
let attempted = false

export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export function getRedis(): Redis | null {
  if (attempted) return client
  attempted = true

  if (!isRedisConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[redis] UPSTASH_REDIS_REST_URL/TOKEN not set — running without persistence')
    }
    return null
  }

  try {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    })
  } catch (err) {
    console.error('[redis] client init failed', err)
    client = null
  }

  return client
}
