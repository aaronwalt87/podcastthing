import Link from 'next/link'
import NewsRow from './NewsRow'
import type { NewsItem } from '@/types/news'

interface NewsDigestProps {
  items: NewsItem[]
  now: number
  limit?: number
}

/**
 * Homepage cut of the feed. Takes the two newest per category before filling
 * with whatever else is recent, so one busy source can't own the whole panel.
 */
export default function NewsDigest({ items, now, limit = 8 }: NewsDigestProps) {
  const categories = Array.from(new Set(items.map((i) => i.category)))

  const spread = categories.flatMap((cat) =>
    items.filter((i) => i.category === cat).slice(0, 2)
  )
  const seen = new Set(spread.map((i) => i.id))
  const filler = items.filter((i) => !seen.has(i.id))

  const digest = [...spread, ...filler]
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, limit)

  if (digest.length === 0) {
    return (
      <div className="panel-flat px-6 py-12 text-center">
        <p className="eyebrow">Feed idle</p>
        <p className="mt-2 text-sm text-paper-2">
          Headlines refresh on a schedule. Nothing is cached right now.
        </p>
      </div>
    )
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-hair px-4 py-3">
        <span className="pulse" aria-hidden="true" />
        <span className="eyebrow">Incoming</span>
        <span className="num ml-auto text-[10px] text-paper-3">{items.length} tracked</span>
      </div>

      <div className="divide-y divide-hair">
        {digest.map((item) => (
          <NewsRow key={item.id} item={item} now={now} />
        ))}
      </div>

      <Link
        href="/news"
        className="flex items-center justify-center gap-2 border-t border-hair px-4 py-3 text-xs text-paper-2 transition-colors hover:bg-white/[0.03] hover:text-paper"
      >
        Open the full feed <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
