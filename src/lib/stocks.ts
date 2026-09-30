import 'server-only'
import { waitUntil } from '@vercel/functions'
import { acquireLock, getRedis } from './redis'
import { sampleMarket, sampleDataEnabled } from './sample-data'
import { parseHistoryCsv, retainMarketData } from './market-history'
import type { DailyClose, MarketSnapshot, MarketState, StockQuote } from '@/types/stocks'

const STOCK_KEY = 'stocks:cache:v3'
const LEGACY_KEY = 'stocks:cache:v2'
const LAST_GOOD_KEY = 'stocks:last-good:v3'
/** See the note on NEWS_TTL_SECONDS — the TTL has to outlive the cron gap. */
const STOCK_TTL = 172_800
const HISTORY_POINTS = 260

interface Tracked {
  symbol: string
  name: string
  sector: string
}

/** SPY/QQQ stand in for the indices — index symbols are paywalled on free tiers. */
const TRACKED: Tracked[] = [
  { symbol: 'SPY', name: 'S&P 500', sector: 'Index' },
  { symbol: 'QQQ', name: 'Nasdaq 100', sector: 'Index' },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors' },
  { symbol: 'AMD', name: 'AMD', sector: 'Semiconductors' },
  { symbol: 'AVGO', name: 'Broadcom', sector: 'Semiconductors' },
  { symbol: 'ARM', name: 'Arm Holdings', sector: 'Semiconductors' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Platforms' },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Platforms' },
  { symbol: 'AAPL', name: 'Apple', sector: 'Platforms' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Platforms' },
  { symbol: 'META', name: 'Meta', sector: 'Platforms' },
  { symbol: 'PLTR', name: 'Palantir', sector: 'Software' },
  { symbol: 'CRWD', name: 'CrowdStrike', sector: 'Software' },
  { symbol: 'NET', name: 'Cloudflare', sector: 'Infrastructure' },
  { symbol: 'DDOG', name: 'Datadog', sector: 'Infrastructure' },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Hardware' },
]

const FETCH_TIMEOUT_MS = 6000

async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timer)
  }
}

/** US market session for a given instant, evaluated in America/New_York. */
export function marketStateAt(date = new Date()): MarketState {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  }).formatToParts(date)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const weekday = get('weekday')
  if (weekday === 'Sat' || weekday === 'Sun') return 'CLOSED'

  // hour can come back as "24" at midnight in some runtimes
  const hour = Number(get('hour')) % 24
  const minutes = hour * 60 + Number(get('minute'))

  if (minutes >= 570 && minutes < 960) return 'REGULAR' // 09:30–16:00
  if (minutes >= 240 && minutes < 570) return 'PRE' //     04:00–09:30
  if (minutes >= 960 && minutes < 1200) return 'POST' //   16:00–20:00
  return 'CLOSED'
}

/* ------------------------------------------------------------------ stooq -- */

/** Dated Stooq daily closes. STOOQ_API_KEY is server-only and never serialized. */
function stooqDate(offsetDays: number): string {
  const d = new Date(Date.now() - offsetDays * 86_400_000)
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('')
}

async function fetchHistory(symbol: string): Promise<DailyClose[]> {
  try {
    const url = new URL('https://stooq.com/q/d/l/')
    url.searchParams.set('s', `${symbol.toLowerCase()}.us`)
    url.searchParams.set('i', 'd')
    url.searchParams.set('d1', stooqDate(400))
    url.searchParams.set('d2', stooqDate(0))
    if (process.env.STOOQ_API_KEY) url.searchParams.set('apikey', process.env.STOOQ_API_KEY)
    const res = await fetchWithTimeout(url.toString())
    if (!res.ok) {
      console.warn(`[stocks] history unavailable for ${symbol}: HTTP ${res.status}`)
      return []
    }
    const points = parseHistoryCsv(await res.text()).filter(point => point.date <= new Date().toISOString().slice(0, 10)).slice(-HISTORY_POINTS)
    if (points.length < 2) console.warn(`[stocks] history unavailable for ${symbol}: no usable daily closes`)
    return points
  } catch {
    // Do not log URLs or raw upstream errors: they may contain provider keys.
    console.warn(`[stocks] history request failed for ${symbol}`)
    return []
  }
}

/* ---------------------------------------------------------------- finnhub -- */

interface FinnhubQuote {
  c: number // current
  d: number // change
  dp: number // change percent
  pc: number // previous close
  t?: number // provider quote timestamp, Unix seconds
}

async function fetchFinnhubQuote(symbol: string, token: string): Promise<FinnhubQuote | null> {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`
    const res = await fetchWithTimeout(url)
    if (!res.ok) return null
    const q = (await res.json()) as FinnhubQuote
    return q && Number.isFinite(q.c) && q.c > 0 ? q : null
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ build -- */

function buildQuote(
  tracked: Tracked,
  history: DailyClose[],
  live: FinnhubQuote | null,
  state: MarketState
): StockQuote | null {
  // Live quote wins; otherwise derive from the last two daily closes.
  const lastClose = history.at(-1)?.close
  const priorClose = history.at(-2)?.close

  let price: number
  let previousClose: number
  let source: StockQuote['source']

  if (live) {
    price = live.c
    previousClose = Number.isFinite(live.pc) && live.pc > 0 ? live.pc : (lastClose ?? live.c)
    source = 'finnhub'
  } else if (lastClose && priorClose) {
    price = lastClose
    previousClose = priorClose
    source = 'stooq'
  } else {
    return null
  }

  const change = price - previousClose
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0

  return {
    symbol: tracked.symbol,
    name: tracked.name,
    sector: tracked.sector,
    price,
    change,
    changePercent,
    previousClose,
    // Daily closes must remain daily closes; never append an intraday quote.
    history: history.map(point => point.close),
    dailyHistory: history,
    historyFetchedAt: history.length >= 2 ? Date.now() : undefined,
    marketState: state,
    source,
    updatedAt: live
      ? (typeof live.t === 'number' && Number.isFinite(live.t) && live.t > 0 && live.t * 1000 <= Date.now() + 300_000 ? live.t * 1000 : 0)
      : Date.parse(`${history.at(-1)!.date}T00:00:00Z`),
    fetchedAt: Date.now(),
  }
}

/** Run tasks with a ceiling on how many are in flight at once. */
async function pooled<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await task(items[index])
    }
  })

  await Promise.all(workers)
  return results
}

export async function refreshStocks(): Promise<MarketSnapshot> {
  const token = process.env.FINNHUB_TOKEN
  const state = marketStateAt()
  const redis = getRedis()
  let previous: MarketSnapshot | null = null
  if (redis) {
    try {
      previous = parseSnapshot(await redis.get(LAST_GOOD_KEY)) ?? parseSnapshot(await redis.get(STOCK_KEY)) ?? parseSnapshot(await redis.get(LEGACY_KEY))
    } catch { /* Upstream refresh can still work if a cache read fails. */ }
  }

  // Six at a time: sixteen concurrent cold fetches on a serverless container
  // push the slowest symbols past their timeout and drop them from the board.
  const results = await pooled(TRACKED, 6, async (tracked) => {
    const [history, live] = await Promise.all([
      fetchHistory(tracked.symbol),
      token ? fetchFinnhubQuote(tracked.symbol, token) : Promise.resolve(null),
    ])
    const quote = retainMarketData(buildQuote(tracked, history, live, state), previous?.quotes.find(q => q.symbol === tracked.symbol))
    if (!quote) {
      // Silently vanishing from the board is worse than a noisy log line.
      console.warn(`[stocks] no usable data for ${tracked.symbol}`)
    }
    return quote
  })

  const quotes = results.filter((q): q is StockQuote => q !== null)
  const snapshot = summarize(quotes, state)

  // A run interrupted partway would otherwise cache four of sixteen symbols for
  // two days, and a truncated board is worse than an empty one — the empty
  // state at least explains itself.
  if (quotes.length >= Math.ceil(TRACKED.length / 2)) {
    if (redis) {
      try {
        await redis.set(STOCK_KEY, JSON.stringify(snapshot), { ex: STOCK_TTL })
        await redis.set(LAST_GOOD_KEY, JSON.stringify(snapshot), { ex: 90 * 86_400 })
      } catch (err) {
        console.error('[stocks] cache write failed', err)
      }
    }
  }

  return snapshot
}

function summarize(quotes: StockQuote[], state: MarketState): MarketSnapshot {
  return {
    quotes,
    advancers: quotes.filter((q) => q.changePercent > 0).length,
    decliners: quotes.filter((q) => q.changePercent < 0).length,
    marketState: state,
    updatedAt: Date.now(),
  }
}

const EMPTY_SNAPSHOT: MarketSnapshot = {
  quotes: [],
  advancers: 0,
  decliners: 0,
  marketState: 'CLOSED',
  updatedAt: 0,
}

function parseSnapshot(raw: unknown): MarketSnapshot | null {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw
    return value && Array.isArray(value.quotes) ? value as MarketSnapshot : null
  } catch { return null }
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const redis = getRedis()
  if (!redis) {
    return sampleDataEnabled() ? sampleMarket() : { ...EMPTY_SNAPSHOT, marketState: marketStateAt() }
  }
  try {
    const current = parseSnapshot(await redis.get(STOCK_KEY))
    // Old quotes stay visible during migration; undated arrays never become dated history.
    const fallback = current ?? parseSnapshot(await redis.get(LAST_GOOD_KEY)) ?? parseSnapshot(await redis.get(LEGACY_KEY))
    if (!current && await acquireLock('lock:stocks:refresh', 180)) {
      waitUntil(refreshStocks().catch(() => console.error('[stocks] warm refresh failed')))
    }
    return { ...(fallback ?? EMPTY_SNAPSHOT), marketState: marketStateAt() }
  } catch {
    console.error('[stocks] cache read failed')
    return { ...EMPTY_SNAPSHOT, marketState: marketStateAt() }
  }
}
