import redis from './redis'
import type { NewsItem, NewsCategory } from '@/types/news'

const NEWS_KEY = 'news:cache'
const NEWS_TTL_SECONDS = Number(process.env.NEWS_TTL_SECONDS ?? 7200)
const MAX_ITEMS = 60

const RSS_SOURCES: { url: string; name: string; type: 'rss'; category: NewsCategory }[] = [
  // ── AI ──────────────────────────────────────────────────────────────────────
  { url: 'https://openai.com/news/rss.xml',                                    name: 'OpenAI',       type: 'rss', category: 'AI' },
  { url: 'https://venturebeat.com/category/ai/feed/',                          name: 'VentureBeat',  type: 'rss', category: 'AI' },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',  name: 'The Verge',    type: 'rss', category: 'AI' },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/',      name: 'TechCrunch',   type: 'rss', category: 'AI' },

  // ── Misc Tech News ───────────────────────────────────────────────────────────
  { url: 'https://news.ycombinator.com/rss',                                   name: 'HN',           type: 'rss', category: 'Misc' },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',           name: 'Ars Technica', type: 'rss', category: 'Misc' },
  { url: 'https://www.wired.com/feed/rss',                                     name: 'Wired',        type: 'rss', category: 'Misc' },

  // ── Hardware ─────────────────────────────────────────────────────────────────
  { url: 'https://www.tomshardware.com/feeds/all',                             name: "Tom's HW",     type: 'rss', category: 'Hardware' },
  { url: 'https://www.servethehome.com/feed/',                                 name: 'ServeTheHome', type: 'rss', category: 'Hardware' },
  { url: 'https://www.phoronix.com/rss.php',                                   name: 'Phoronix',     type: 'rss', category: 'Hardware' },

  // ── IT / Sysadmin ────────────────────────────────────────────────────────────
  { url: 'https://www.bleepingcomputer.com/feed/',                             name: 'BleepingComp', type: 'rss', category: 'IT' },
  { url: 'https://www.theregister.com/headlines.atom',                         name: 'The Register', type: 'rss', category: 'IT' },
  { url: 'https://isc.sans.edu/rssfeed.xml',                                   name: 'SANS ISC',     type: 'rss', category: 'IT' },

  // ── Tech Finance ─────────────────────────────────────────────────────────────
  { url: 'https://techcrunch.com/category/startups/feed/',                     name: 'TC Startups',  type: 'rss', category: 'Finance' },
  { url: 'https://www.theverge.com/rss/business/index.xml',                    name: 'Verge Biz',    type: 'rss', category: 'Finance' },
  { url: 'https://feeds.reuters.com/reuters/technologyNews',                   name: 'Reuters Tech', type: 'rss', category: 'Finance' },
]

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const HN_QUERIES: { query: string; category: NewsCategory }[] = [
  { query: 'claude anthropic',           category: 'AI'       },
  { query: 'chatgpt openai gpt',         category: 'AI'       },
  { query: 'llm ai model',               category: 'AI'       },
  { query: 'gpu cpu processor chip',     category: 'Hardware' },
  { query: 'sysadmin devops kubernetes', category: 'IT'       },
  { query: 'startup funding acquisition',category: 'Finance'  },
]

function extractField(block: string, tag: string): string {
  const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
  if (cdataMatch) return cdataMatch[1].trim()
  const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return plainMatch ? plainMatch[1].trim() : ''
}

function extractRssLink(block: string): string {
  const match = block.match(/<link>([^<]+)<\/link>/)
  if (match) return match[1].trim()
  const guid = block.match(/<guid[^>]*>([^<]+)<\/guid>/)
  return guid ? guid[1].trim() : ''
}

function extractAtomLink(block: string): string {
  const alt = block.match(/<link[^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["']/)
  if (alt) return alt[1].trim()
  const href = block.match(/<link[^>]+href=["']([^"']+)["']/)
  return href ? href[1].trim() : ''
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#x([0-9A-Fa-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

const AI_KEYWORDS = /\b(ai|llm|gpt|claude|openai|anthropic|gemini|mistral|chatgpt|copilot|machine learning|neural|model|transformer|diffusion|inference|multimodal)\b/i
const HW_KEYWORDS = /\b(gpu|cpu|processor|chip|silicon|benchmark|ram|ssd|nvme|nvidia|amd|intel|arm|risc|datacenter|data center)\b/i
const IT_KEYWORDS = /\b(security|vulnerability|cve|patch|exploit|ransomware|breach|hack|malware|phishing|kubernetes|devops|linux|sysadmin|firewall|zero.?day)\b/i
const FIN_KEYWORDS = /\b(funding|acquisition|ipo|startup|venture|billion|million|valuation|raise|merger|series [a-d])\b/i

function classifyTitle(title: string, fallback: NewsCategory): NewsCategory {
  if (AI_KEYWORDS.test(title)) return 'AI'
  if (HW_KEYWORDS.test(title)) return 'Hardware'
  if (IT_KEYWORDS.test(title)) return 'IT'
  if (FIN_KEYWORDS.test(title)) return 'Finance'
  return fallback
}

function makeId(source: string, link: string): string {
  const str = source + '|' + link
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return ((h2 >>> 0).toString(16) + (h1 >>> 0).toString(16)).padStart(16, '0')
}

function parseRss2Feed(xml: string, sourceName: string, category: NewsCategory): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<item[\s\S]*?<\/item>/g) ?? []
  for (const block of blocks) {
    const title = stripHtml(extractField(block, 'title'))
    const link = extractRssLink(block)
    const pubDate = extractField(block, 'pubDate')
    const description = extractField(block, 'description') || extractField(block, 'content:encoded')
    const summary = stripHtml(description).slice(0, 200)
    const publishedAt = pubDate ? new Date(pubDate).getTime() : Date.now()
    if (!title || !link) continue
    items.push({ id: makeId(sourceName, link), title, link, source: sourceName, sourceType: 'rss', publishedAt: isNaN(publishedAt) ? Date.now() : publishedAt, summary, category: category === 'Misc' ? classifyTitle(title, 'Misc') : category })
  }
  return items
}

function parseAtomFeed(xml: string, sourceName: string, category: NewsCategory): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<entry[\s\S]*?<\/entry>/g) ?? []
  for (const block of blocks) {
    const title = stripHtml(extractField(block, 'title'))
    const link = extractAtomLink(block)
    const updated = extractField(block, 'updated') || extractField(block, 'published')
    const summary = stripHtml(extractField(block, 'summary') || extractField(block, 'content')).slice(0, 200)
    const publishedAt = updated ? new Date(updated).getTime() : Date.now()
    if (!title || !link) continue
    items.push({ id: makeId(sourceName, link), title, link, source: sourceName, sourceType: 'rss', publishedAt: isNaN(publishedAt) ? Date.now() : publishedAt, summary, category: category === 'Misc' ? classifyTitle(title, 'Misc') : category })
  }
  return items
}

function parseRssFeed(xml: string, sourceName: string, category: NewsCategory): NewsItem[] {
  if (xml.includes('<feed') && xml.includes('<entry')) return parseAtomFeed(xml, sourceName, category)
  return parseRss2Feed(xml, sourceName, category)
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal, headers: { 'User-Agent': BROWSER_UA } })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchRssSource(url: string, name: string, category: NewsCategory): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(url, 6000)
    if (!res.ok) return []
    const xml = await res.text()
    return parseRssFeed(xml, name, category)
  } catch {
    return []
  }
}

interface HNAlgoliaHit {
  objectID: string
  title: string
  url?: string
  created_at_i: number
  points: number
  story_text?: string
}

interface HNAlgoliaResponse {
  hits: HNAlgoliaHit[]
}

async function fetchHNQuery(query: string, category: NewsCategory): Promise<NewsItem[]> {
  try {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=8`
    const res = await fetchWithTimeout(url, 6000)
    if (!res.ok) return []
    const json = (await res.json()) as HNAlgoliaResponse
    return (json.hits ?? [])
      .filter((h) => h.url && h.points > 5)
      .map((h) => ({
        id: makeId('HackerNews', h.url!),
        title: h.title,
        link: h.url!,
        source: 'Hacker News',
        sourceType: 'social' as const,
        publishedAt: h.created_at_i * 1000,
        summary: stripHtml(h.story_text ?? '').slice(0, 200),
        category: classifyTitle(h.title, category),
      }))
  } catch {
    return []
  }
}

export async function refreshNews(): Promise<NewsItem[]> {
  const [rssResults, hnResults] = await Promise.all([
    Promise.allSettled(RSS_SOURCES.map((s) => fetchRssSource(s.url, s.name, s.category))),
    Promise.allSettled(HN_QUERIES.map((q) => fetchHNQuery(q.query, q.category))),
  ])

  const allItems = [
    ...rssResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
    ...hnResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
  ]

  const seen = new Set<string>()
  const deduped = allItems
    .filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, MAX_ITEMS)

  await redis.set(NEWS_KEY, JSON.stringify(deduped), { ex: NEWS_TTL_SECONDS })
  return deduped
}

export async function getCachedNews(): Promise<NewsItem[]> {
  try {
    const raw = await redis.get(NEWS_KEY)
    if (!raw) return []
    if (Array.isArray(raw)) return raw as NewsItem[]
    if (typeof raw === 'string') return JSON.parse(raw) as NewsItem[]
    return []
  } catch {
    return []
  }
}
