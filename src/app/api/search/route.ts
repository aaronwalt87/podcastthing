import { NextResponse } from 'next/server'
import { getAllEpisodes } from '@/lib/episodes'
import { getCachedNews } from '@/lib/news'
import { getMarketSnapshot } from '@/lib/stocks'
import type { SearchRecord } from '@/types/search'

export const dynamic = 'force-dynamic'

/**
 * Flat index behind the command palette. Slim on purpose — titles and links
 * only, so the payload stays small enough to fetch on first open.
 */
export async function GET() {
  const [episodes, news, market] = await Promise.all([
    getAllEpisodes(),
    getCachedNews(),
    getMarketSnapshot(),
  ])

  const records: SearchRecord[] = [
    ...episodes.map((ep) => ({
      id: `ep-${ep.id}`,
      kind: 'episode' as const,
      title: ep.title,
      subtitle: ep.showName,
      href: `/podcasts?play=${encodeURIComponent(ep.id)}`,
      external: false,
    })),
    ...news.slice(0, 60).map((item) => ({
      id: `news-${item.id}`,
      kind: 'news' as const,
      title: item.title,
      subtitle: `${item.source} · ${item.category}`,
      href: item.link,
      external: true,
    })),
    ...market.quotes.map((q) => ({
      id: `sym-${q.symbol}`,
      kind: 'symbol' as const,
      title: q.symbol,
      subtitle: q.name,
      href: '/markets',
      external: false,
    })),
  ]

  return NextResponse.json(
    { records },
    { headers: { 'Cache-Control': 'private, max-age=60' } }
  )
}
