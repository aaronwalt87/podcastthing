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
]

// Reddit subreddits covering AI/Claude/ChatGPT community
const REDDIT_SUBS = [
  'ClaudeAI',
  'ChatGPT',
  'artificial',
  'MachineLearning',
  'agentsofai',
  'LocalLLaMA',
  'singularity',
  'OpenAI',
]

// AI-related keywords for filtering Hacker News stories
const HN_AI_TERMS = ['ai', 'llm', 'claude', 'chatgpt', 'gpt', 'anthropic', 'openai', 'gemini', 'mistral', 'llama', 'machine learning', 'neural', 'model', 'agent', 'transformer']

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function extractField(block: string, tag: string): string {
  const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
  if (cdataMatch) return cdataMatch[1].trim()
  const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return plainMatch ? plainMatch[1].trim() : ''
}

function extractLink(block: string): string {
  const match = block.match(/<link>([^<]+)<\/link>/)
  if (match) return match[1].trim()
  const guid = block.match(/<guid[^>]*>([^<]+)<\/guid>/)
  return guid ? guid[1].trim() : ''
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
  try {
    return btoa(unescape(encodeURIComponent(source + link))).replace(/[^a-z0-9]/gi, '').slice(0, 16)
  } catch {
    return Math.random().toString(36).slice(2, 18)
  }
}

export function parseRssFeed(xml: string, sourceName: string, sourceType: 'rss' | 'social'): NewsItem[] {
  const items: NewsItem[] = []
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/g) ?? []

  for (const block of itemBlocks) {
    const title = stripHtml(extractField(block, 'title'))
    const link = extractLink(block)
    const pubDate = extractField(block, 'pubDate')
    const description = extractField(block, 'description') || extractField(block, 'content:encoded')
    const summary = stripHtml(description).slice(0, 200)
    const publishedAt = pubDate ? new Date(pubDate).getTime() : Date.now()

    if (!title || !link) continue
    if (title.toLowerCase().includes('whitelisted') || title.toLowerCase().includes('error')) continue

    items.push({
      id: makeId(sourceName, link),
      title,
      link,
      source: sourceName,
      sourceType,
      publishedAt: isNaN(publishedAt) ? Date.now() : publishedAt,
      summary,
    })
  }

  return items
}

async function fetchWithTimeout(url: string, timeoutMs: number, headers?: Record<string, string>): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA, ...headers },
    })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchRssSource(url: string, name: string, sourceType: 'rss' | 'social'): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout(url, 6000)
    if (!res.ok) return []
    const xml = await res.text()
    return parseRssFeed(xml, name, sourceType)
  } catch {
    return []
  }
}

interface RedditPost {
  data: {
    title: string
    url: string
    permalink: string
    created_utc: number
    selftext: string
    score: number
    is_self: boolean
  }
}

interface RedditResponse {
  data: { children: RedditPost[] }
}

async function fetchRedditSubreddit(subreddit: string): Promise<NewsItem[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`
    const res = await fetchWithTimeout(url, 6000, {
      Accept: 'application/json',
    })
    if (!res.ok) return []
    const json = (await res.json()) as RedditResponse
    return (json?.data?.children ?? [])
      .filter((p) => p.data.score > 5)
      .map((p) => {
        const d = p.data
        const link = d.is_self ? `https://www.reddit.com${d.permalink}` : d.url
        return {
          id: makeId(`r/${subreddit}`, link),
          title: d.title,
          link,
          source: `r/${subreddit}`,
          sourceType: 'social' as const,
          publishedAt: d.created_utc * 1000,
          summary: d.is_self ? stripHtml(d.selftext).slice(0, 200) : '',
        }
      })
  } catch {
    return []
  }
}

interface HNItem {
  id: number
  title: string
  url?: string
  score: number
  time: number
  descendants?: number
}

async function fetchHackerNewsAI(): Promise<NewsItem[]> {
  try {
    const res = await fetchWithTimeout('https://hacker-news.firebaseio.com/v0/topstories.json', 5000)
    if (!res.ok) return []
    const ids = (await res.json()) as number[]

    const top50 = ids.slice(0, 50)
    const stories = await Promise.allSettled(
      top50.map(async (id) => {
        const r = await fetchWithTimeout(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, 4000)
        return r.ok ? (await r.json()) as HNItem : null
      })
    )

    return stories
      .flatMap((r) => (r.status === 'fulfilled' && r.value ? [r.value] : []))
      .filter((item) => {
        if (!item.title || !item.url) return false
        const lower = item.title.toLowerCase()
        return HN_AI_TERMS.some((term) => lower.includes(term))
      })
      .slice(0, 8)
      .map((item) => ({
        id: makeId('HackerNews', item.url!),
        title: item.title,
        link: item.url!,
        source: 'Hacker News',
        sourceType: 'social' as const,
        publishedAt: item.time * 1000,
        summary: '',
      }))
  } catch {
    return []
  }
}

export async function refreshNews(): Promise<NewsItem[]> {
  const [rssResults, redditResults, hnItems] = await Promise.all([
    Promise.allSettled(RSS_SOURCES.map((s) => fetchRssSource(s.url, s.name, s.type))),
    Promise.allSettled(REDDIT_SUBS.map(fetchRedditSubreddit)),
    fetchHackerNewsAI(),
  ])

  const allItems = [
    ...rssResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
    ...redditResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])),
    ...hnItems,
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
