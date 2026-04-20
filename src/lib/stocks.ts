import redis from './redis'
import type { StockQuote } from '@/types/stocks'

const STOCK_KEY = 'stocks:cache'
const STOCK_TTL = 3600

// SPY used as S&P 500 proxy (GSPC not reliably available on Finnhub free tier)
const TRACKED_SYMBOLS = ['SPY', 'NVDA', 'META', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'TSLA', 'AMD', 'ARM', 'PLTR', 'AVGO']

const DISPLAY_NAMES: Record<string, string> = {
  'SPY':   'S&P 500',
  'NVDA':  'NVIDIA',
  'META':  'Meta',
  'MSFT':  'Microsoft',
  'AAPL':  'Apple',
  'GOOGL': 'Alphabet',
  'AMZN':  'Amazon',
  'TSLA':  'Tesla',
  'AMD':   'AMD',
  'ARM':   'Arm Holdings',
  'PLTR':  'Palantir',
  'AVGO':  'Broadcom',
}

interface FinnhubQuote {
  c: number  // current price
  d: number  // change
  dp: number // change percent
  t: number  // timestamp (unix)
}

function marketState(timestampSec: number): StockQuote['marketState'] {
  const d = new Date(timestampSec * 1000)
  const nyTime = new Date(d.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const h = nyTime.getHours()
  const m = nyTime.getMinutes()
  const day = nyTime.getDay()
  const minsSinceMidnight = h * 60 + m

  if (day === 0 || day === 6) return 'CLOSED'
  if (minsSinceMidnight >= 570 && minsSinceMidnight < 960) return 'REGULAR'  // 9:30–16:00
  if (minsSinceMidnight >= 240 && minsSinceMidnight < 570) return 'PRE'       // 4:00–9:30
  if (minsSinceMidnight >= 960 && minsSinceMidnight < 1200) return 'POST'     // 16:00–20:00
  return 'CLOSED'
}

async function fetchQuote(symbol: string, token: string): Promise<StockQuote | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
      { signal: controller.signal }
    )
    clearTimeout(timer)
    if (!res.ok) return null

    const q = (await res.json()) as FinnhubQuote
    if (!q.c || q.c === 0) return null

    return {
      symbol,
      name: DISPLAY_NAMES[symbol] ?? symbol,
      price: q.c,
      change: q.d ?? 0,
      changePercent: q.dp ?? 0,
      marketState: marketState(q.t),
      updatedAt: Date.now(),
    }
  } catch {
    return null
  }
}

export async function refreshStocks(): Promise<StockQuote[]> {
  const token = process.env.FINNHUB_TOKEN
  if (!token) return []

  const results = await Promise.all(TRACKED_SYMBOLS.map((s) => fetchQuote(s, token)))
  const quotes = results.filter((q): q is StockQuote => q !== null)

  if (quotes.length > 0) {
    await redis.set(STOCK_KEY, JSON.stringify(quotes), { ex: STOCK_TTL })
  }
  return quotes
}

export async function getCachedStocks(): Promise<StockQuote[]> {
  try {
    const raw = await redis.get(STOCK_KEY)
    if (!raw) return []
    if (Array.isArray(raw)) return raw as StockQuote[]
    if (typeof raw === 'string') return JSON.parse(raw) as StockQuote[]
    return []
  } catch {
    return []
  }
}
