'use client'

import { timeAgo } from '@/lib/format'
import type { NewsItem } from '@/types/news'

interface NewsRowProps {
  item: NewsItem
  /** Fixed reference time so server and client render the same relative age. */
  now: number
  showSummary?: boolean
}

export default function NewsRow({ item, now, showSummary = false }: NewsRowProps) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1.5 px-4 py-3.5 transition-colors hover:bg-white/[0.03]"
    >
      <div className="flex items-center gap-2.5">
        <span className="num text-[10px] uppercase tracking-wider text-ember">{item.source}</span>
        <span aria-hidden="true" className="h-2.5 w-px bg-hair-2" />
        <span className="num text-[10px] uppercase tracking-wider text-paper-3">
          {item.category}
        </span>
        <time
          className="num ml-auto text-[10px] text-paper-3"
          dateTime={new Date(item.publishedAt).toISOString()}
        >
          {timeAgo(item.publishedAt, now)}
        </time>
      </div>

      <p className="clamp-2 text-[14px] leading-snug text-paper transition-colors group-hover:text-ember-soft">
        {item.title}
      </p>

      {showSummary && item.summary && (
        <p className="clamp-2 text-[13px] leading-relaxed text-paper-3">{item.summary}</p>
      )}
    </a>
  )
}
