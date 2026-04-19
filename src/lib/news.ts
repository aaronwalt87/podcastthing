import redis from './redis'
import type { NewsItem } from '@/types/news'

const NEWS_KEY = 'news:cache'
const NEWS_TTL_SECONDS = Number(process.env.NEWS_TTL_SECONDS ?? 7200)
const MAX_ITEMS = 30

const RSS_SOURCES = [
  { url: 'https://openai.com/news/rss.xml',                                   name: 'OpenAI',      type: 'rss' as const },
  { url: 'https://venturebeat.com/category/ai/feed/',                         name: 'VentureBeat', type: 'rss' as const },
  { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', name: 'The Verge',   type: 'rss' as const },
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/',     name: 'TechCrunch',  type: 'rss' as const },
  { url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',          name: 'Ars Technica', type: 'rss' as const },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss',                      name: 'Wired',       type: 'rss' as const },
]

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

// HN Algolia queries — each returns top AI stories matching that term
const HN_QUERIES = ['claude anthropic', 'chatgpt openai', 'llm ai model']

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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
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

function parseRss2Feed(xml: string, sourceName: string): NewsItem[] {
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
    items.push({ id: makeId(sourceName, link), title, link, source: sourceName, sourceType: 'rss', publishedAt: isNaN(publishedAt) ? Date.now() : publishedAt, summary })
  }
  return items
}

function parseAtomFeed(xml: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = []
  const blocks = xml.match(/<entry[\s\S]*?<\/entry>/g) ?? []
  for (const block of blocks) {
    const title = stripHtml(extractField(block, 'title'))
    const link = extractAtomLink(block)
    const updated = extractField(block, 'updated') || extractField(block, 'published')
    const summary = stripHtml(extractField(block, 'summary') || extractField(block, 'content')).slice(0, 200)
    const publishedAt = updated ? new Date(updated).getTime() : Date.now()
    if (!title || !link) continue
    items.push({ id: makeId(sourceName, link), title, link, source: sourceName, sourceType: 'rss', publishedAt: isNaN(publishedAt) ? Date.now() : publishedAt, summary })
  }
  return items
}

export function parseRssFeed(xml: string, sourceName: string, sourceType: 'rss' | 'social'): NewsItem[] {
  void sourceType
  if (xml.includes('<feed') && xml.includes('<entry')) return parseAtomFeed(xml, sourceName)
  return parseRss2Feed(xml, sourceName)
}

async function fetchWithTimeout(url: string, timeoutMs: number, headers?: Record<string, string>): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal, headers: { 'User-Agent': BROWSER_UA, ...headers } })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchRssSource(url: string, name: string): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(url, 6000)
    if (!res.ok) return []
    const xml = await res.text()
    return parseRssFeed(xml, name, 'rss')
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

async function fetchHNQuery(query: string): Promise<NewsItem[]> {
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
      }))
  } catch {
    return []
  }
}

export async function refreshNews(): Promise<NewsItem[]> {
  const [rssResults, hnResults] = await Promise.all([
    Promise.allSettled(RSS_SOURCES.map((s) => fetchRssSource(s.url, s.name))),
    Promise.allSettled(HN_QUERIES.map(fetchHNQuery)),
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
