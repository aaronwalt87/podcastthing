import type { Episode } from '@/types/episode'
import type { NewsItem } from '@/types/news'
import type { MarketSnapshot, StockQuote } from '@/types/stocks'

/**
 * Development-only fixtures.
 *
 * These are returned exclusively when `NODE_ENV !== 'production'` AND no Redis
 * is configured, so a fresh clone renders a populated site without credentials.
 * Production never reaches this module's data — an unconfigured production
 * deployment shows real empty states instead. See `sampleDataEnabled()`.
 */
export function sampleDataEnabled(): boolean {
  return process.env.NODE_ENV !== 'production'
}

const DAY = 86_400_000

/** Deterministic pseudo-random walk so screenshots and diffs stay stable. */
function walk(seed: number, start: number, points = 60, drift = 0.0015): number[] {
  let value = start
  let state = seed
  const out: number[] = []
  for (let i = 0; i < points; i++) {
    state = (state * 1664525 + 1013904223) % 4294967296
    const noise = (state / 4294967296 - 0.5) * 0.035
    value = value * (1 + drift + noise)
    out.push(Number(value.toFixed(2)))
  }
  return out
}

function quote(
  symbol: string,
  name: string,
  sector: string,
  seed: number,
  start: number
): StockQuote {
  const history = walk(seed, start)
  const price = history[history.length - 1]
  const previousClose = history[history.length - 2]
  const change = price - previousClose

  return {
    symbol,
    name,
    sector,
    price,
    change,
    changePercent: (change / previousClose) * 100,
    previousClose,
    history,
    marketState: 'REGULAR',
    source: 'stooq',
    updatedAt: Date.now() - 12 * 60_000,
  }
}

export function sampleMarket(): MarketSnapshot {
  const quotes = [
    quote('SPY', 'S&P 500', 'Index', 7, 542),
    quote('QQQ', 'Nasdaq 100', 'Index', 13, 468),
    quote('NVDA', 'NVIDIA', 'Semiconductors', 23, 118),
    quote('AMD', 'AMD', 'Semiconductors', 31, 152),
    quote('AVGO', 'Broadcom', 'Semiconductors', 47, 174),
    quote('ARM', 'Arm Holdings', 'Semiconductors', 53, 131),
    quote('MSFT', 'Microsoft', 'Platforms', 61, 421),
    quote('GOOGL', 'Alphabet', 'Platforms', 71, 178),
    quote('AAPL', 'Apple', 'Platforms', 83, 229),
    quote('AMZN', 'Amazon', 'Platforms', 97, 202),
    quote('META', 'Meta', 'Platforms', 103, 573),
    quote('PLTR', 'Palantir', 'Software', 109, 41),
    quote('CRWD', 'CrowdStrike', 'Software', 127, 298),
    quote('NET', 'Cloudflare', 'Infrastructure', 139, 104),
    quote('DDOG', 'Datadog', 'Infrastructure', 149, 128),
    quote('TSLA', 'Tesla', 'Hardware', 157, 248),
  ]

  return {
    quotes,
    advancers: quotes.filter((q) => q.changePercent > 0).length,
    decliners: quotes.filter((q) => q.changePercent < 0).length,
    marketState: 'REGULAR',
    updatedAt: Date.now() - 12 * 60_000,
  }
}

/**
 * Publisher names are recycled from the real source list so the layout matches
 * production density. The headlines themselves are fictional — see the summary
 * text and the development banner, which say so on screen.
 */
const HEADLINES: [string, string, NewsItem['category'], number][] = [
  ['Anthropic ships a longer-context Claude aimed at codebase-scale reasoning', 'The Verge', 'AI', 0.4],
  ['OpenAI details its inference cost curve for the first time', 'TechCrunch', 'AI', 1.2],
  ['Why small models keep beating big ones on structured extraction', 'Hacker News', 'AI', 2.1],
  ['A practical guide to running LLM inference on commodity GPUs', 'Ars Technica', 'AI', 3.6],
  ['NVIDIA supply constraints ease as new fab capacity comes online', "Tom's HW", 'Hardware', 1.8],
  ['Benchmarking NVMe over TCP against local storage at scale', 'ServeTheHome', 'Hardware', 4.4],
  ['Linux 6.19 lands a rewrite of the scheduler fair-share path', 'Phoronix', 'Hardware', 6.2],
  ['Critical auth bypass in a widely deployed reverse proxy', 'BleepingComp', 'IT', 0.9],
  ['The Register: cloud provider outage traced to a BGP misconfiguration', 'The Register', 'IT', 2.7],
  ['SANS ISC: mass scanning for an exposed management port spikes', 'SANS ISC', 'IT', 5.1],
  ['Kubernetes 1.34 deprecates in-tree cloud providers for good', 'Hacker News', 'IT', 7.5],
  ['Infrastructure startup raises Series B to automate incident response', 'TC Startups', 'Finance', 1.5],
  ['Chip designer files for a listing at a reported $12B valuation', 'Verge Biz', 'Finance', 3.1],
  ['Enterprise software multiples compress for the third quarter running', 'Reuters Tech', 'Finance', 8.3],
  ['The quiet return of the on-premises data centre', 'Wired', 'Misc', 2.4],
  ['A field guide to reading your own observability bill', 'Ars Technica', 'Misc', 9.6],
]

export function sampleNews(): NewsItem[] {
  return HEADLINES.map(([title, source, category, hoursAgo], i) => ({
    id: `sample-${i}`,
    title,
    link: 'https://example.com',
    source,
    sourceType: source === 'Hacker News' ? ('social' as const) : ('rss' as const),
    publishedAt: Date.now() - hoursAgo * 3_600_000,
    summary:
      'PLACEHOLDER — local development only. This headline is invented and did not come from this publication.',
    category,
  })).sort((a, b) => b.publishedAt - a.publishedAt)
}

const EPISODES: [string, string, string, string][] = [
  [
    'Running infrastructure when nobody notices it working',
    'The Pragmatic Engineer',
    'Infrastructure',
    'What good operations actually looks like from the inside — on-call design, the economics of redundancy, and why the best week is the boring one.',
  ],
  [
    'The hosting business, twenty years in',
    'Signals & Threads',
    'Systems',
    'Margins, churn, and the long tail of support tickets. A conversation about what changed when everything moved to someone else’s computer.',
  ],
  [
    'How AI coding tools change the shape of a team',
    'Latent Space',
    'AI',
    'Less time typing, more time reviewing. What happens to code ownership when the first draft is written by a model.',
  ],
  [
    'Incident review as a design practice',
    'SRE Weekly',
    'Systems',
    'Blameless postmortems are table stakes. The interesting part is what you change about the system afterwards.',
  ],
  [
    'Cost is a feature',
    'The Changelog',
    'Infrastructure',
    'Observability bills, egress charges, and the architecture decisions that only show up on an invoice.',
  ],
  [
    'Support tickets are a product signal',
    'Software Engineering Daily',
    'Leadership',
    'The fastest feedback loop in the company is sitting in the support queue, and almost nobody reads it.',
  ],
]

export function sampleEpisodes(): Episode[] {
  return EPISODES.map(([title, showName, category, description], i) => ({
    id: `sample-ep-${i}`,
    title,
    showName,
    description,
    // No audio: the card renders a "sample, no audio" chip instead of a play
    // control, so nothing on screen invites a click that does nothing.
    audioUrl: '',
    audioType: 'url' as const,
    category,
    addedAt: Date.now() - (i * 6 + 2) * DAY,
  }))
}
