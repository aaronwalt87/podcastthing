import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function probe(label: string, url: string, headers?: Record<string, string>) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 7000)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA, ...headers },
    })
    clearTimeout(timer)
    const text = await res.text()
    return { label, status: res.status, bytes: text.length, preview: text.slice(0, 120) }
  } catch (e) {
    clearTimeout(timer)
    return { label, status: 0, bytes: 0, preview: String(e) }
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = await Promise.all([
    probe('OpenAI RSS',      'https://openai.com/news/rss.xml'),
    probe('VentureBeat RSS', 'https://venturebeat.com/category/ai/feed/'),
    probe('TheVerge RSS',    'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'),
    probe('TechCrunch RSS',  'https://techcrunch.com/category/artificial-intelligence/feed/'),
    probe('ArsTechnica RSS', 'https://feeds.arstechnica.com/arstechnica/technology-lab'),
    probe('Reddit ClaudeAI', 'https://www.reddit.com/r/ClaudeAI/hot.json?limit=5', { Accept: 'application/json' }),
    probe('Reddit ChatGPT',  'https://www.reddit.com/r/ChatGPT/hot.json?limit=5',  { Accept: 'application/json' }),
    probe('HN top stories',  'https://hacker-news.firebaseio.com/v0/topstories.json'),
  ])

  return NextResponse.json(results)
}
