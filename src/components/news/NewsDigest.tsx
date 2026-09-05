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
  // Round-robin across categories, newest first within each. Sorting the
  // combined list afterwards would undo the spread entirely — the point is that
  // one busy source cannot take every row.
  const buckets = new Map<string, NewsItem[]>()
  for (const item of [...items].sort((a, b) => b.publishedAt - a.publishedAt)) {
    const bucket = buckets.get(item.category)
    if (bucket) bucket.push(item)
    else buckets.set(item.category, [item])
  }

  const lanes = Array.from(buckets.values())
  const digest: NewsItem[] = []
  for (let depth = 0; digest.length < limit; depth++) {
    let placed = false
    for (const lane of lanes) {
      if (digest.length >= limit) break
      const item = lane[depth]
      if (!item) continue
      digest.push(item)
      placed = true
    }
    if (!placed) break
  }

  if (digest.length === 0) {
    return (
      <div className="panel-flat flex h-full flex-col justify-center px-6 py-12 text-center">
        <p className="eyebrow">Feed idle</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-sm text-paper-2">
          Headlines are fetched on a schedule and cached; the cache is empty between runs or just
          after a deploy. Nothing is broken — it refills on the next pass.
        </p>
      </div>
    )
  }

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-hair px-4 py-3">
        <span className="pulse" aria-hidden="true" />
        <span className="eyebrow">Incoming</span>
        <span className="num ml-auto text-[11px] text-paper-3">{items.length} tracked</span>
      </div>

      <div className="flex-1 divide-y divide-hair">
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
