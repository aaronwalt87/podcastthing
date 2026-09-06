import 'server-only'
import { acquireLock, getRedis } from './redis'
import { sampleMarket, sampleDataEnabled } from './sample-data'
import type { MarketSnapshot, MarketState, StockQuote } from '@/types/stocks'

const STOCK_KEY = 'stocks:cache:v2'
/** See the note on NEWS_TTL_SECONDS — the TTL has to outlive the cron gap. */
const STOCK_TTL = 172_800
const HISTORY_POINTS = 60

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

/**
 * Daily closes from Stooq's CSV endpoint. No API key, so history (and a usable
 * fallback quote) works even when FINNHUB_TOKEN is absent.
 */
function stooqDate(offsetDays: number): string {
  const d = new Date(Date.now() - offsetDays * 86_400_000)
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('')
}

async function fetchHistory(symbol: string): Promise<number[]> {
  try {
    // Unbounded, Stooq returns the entire daily history — decades of CSV per
    // symbol, of which we keep 60 rows. Bounding the range keeps each response
    // in the low kilobytes so 16 symbols fit inside the timeout budget.
    const url =
      `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol.toLowerCase())}.us&i=d` +
      `&d1=${stooqDate(130)}&d2=${stooqDate(0)}`
    const res = await fetchWithTimeout(url)
    if (!res.ok) return []

    const csv = await res.text()
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []

    const header = lines[0].split(',')
    const closeIdx = header.findIndex((h) => h.trim().toLowerCase() === 'close')
    if (closeIdx === -1) return []

    return lines
      .slice(1)
      .slice(-HISTORY_POINTS)
      .map((line) => Number(line.split(',')[closeIdx]))
      .filter((n) => Number.isFinite(n) && n > 0)
  } catch {
    return []
  }
}

/* ---------------------------------------------------------------- finnhub -- */

interface FinnhubQuote {
  c: number // current
  d: number // change
  dp: number // change percent
  pc: number // previous close
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
  history: number[],
  live: FinnhubQuote | null,
  state: MarketState
): StockQuote | null {
  // Live quote wins; otherwise derive from the last two daily closes.
  const lastClose = history.at(-1)
  const priorClose = history.at(-2)

  let price: number
  let previousClose: number
  let source: StockQuote['source']

  if (live) {
    price = live.c
    previousClose = Number.isFinite(live.pc) && live.pc > 0 ? live.pc : (priorClose ?? live.c)
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
    // Append the live price so the sparkline ends where the headline number is.
    history: live && lastClose && live.c !== lastClose ? [...history, live.c] : history,
    marketState: state,
    source,
    updatedAt: Date.now(),
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

  // Six at a time: sixteen concurrent cold fetches on a serverless container
  // push the slowest symbols past their timeout and drop them from the board.
  const results = await pooled(TRACKED, 6, async (tracked) => {
    const [history, live] = await Promise.all([
      fetchHistory(tracked.symbol),
      token ? fetchFinnhubQuote(tracked.symbol, token) : Promise.resolve(null),
    ])
    const quote = buildQuote(tracked, history, live, state)
    if (!quote) {
      // Silently vanishing from the board is worse than a noisy log line.
      console.warn(`[stocks] no usable data for ${tracked.symbol}`)
    }
    return quote
  })

  const quotes = results.filter((q): q is StockQuote => q !== null)
  const snapshot = summarize(quotes, state)

  if (quotes.length > 0) {
    const redis = getRedis()
    if (redis) {
      try {
        await redis.set(STOCK_KEY, JSON.stringify(snapshot), { ex: STOCK_TTL })
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

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const redis = getRedis()
  // Local dev with no credentials renders fixtures; production renders empty.
  if (!redis) {
    return sampleDataEnabled() ? sampleMarket() : { ...EMPTY_SNAPSHOT, marketState: marketStateAt() }
  }

  try {
    const raw = await redis.get(STOCK_KEY)
    if (!raw) {
      // See the note in getCachedNews: warm a cold cache rather than serving an
      // empty board until the next scheduled run.
      if (await acquireLock('lock:stocks:refresh', 180)) {
        void refreshStocks().catch((err) => console.error('[stocks] warm refresh failed', err))
      }
      return { ...EMPTY_SNAPSHOT, marketState: marketStateAt() }
    }

    const parsed = (typeof raw === 'string' ? JSON.parse(raw) : raw) as MarketSnapshot
    if (!parsed || !Array.isArray(parsed.quotes)) {
      return { ...EMPTY_SNAPSHOT, marketState: marketStateAt() }
    }

    // Session moves on even while the cache sits still.
    return { ...parsed, marketState: marketStateAt() }
  } catch (err) {
    console.error('[stocks] cache read failed', err)
    return { ...EMPTY_SNAPSHOT, marketState: marketStateAt() }
  }
}

