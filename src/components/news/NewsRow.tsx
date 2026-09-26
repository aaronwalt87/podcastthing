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
      className="group flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-ink-850"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="num text-[11px] uppercase tracking-wider text-paper-2 transition-colors group-hover:text-ember">
          {item.source}
        </span>
        <span aria-hidden="true" className="h-2.5 w-px bg-hair-2" />
        <span className="num text-[11px] uppercase tracking-wider text-paper-3">
          {item.category}
        </span>
        <time
          className="num ml-auto text-[11px] text-paper-3"
          dateTime={new Date(item.publishedAt).toISOString()}
        >
          {timeAgo(item.publishedAt, now)}
        </time>
      </div>

      <p className={`${showSummary ? 'text-[clamp(19px,2.1vw,28px)] font-medium tracking-[-0.04em]' : 'text-[15px]'} leading-snug text-paper transition-colors group-hover:text-ember`}>
        {item.title}
      </p>

      {showSummary && item.summary && (
        <p className="clamp-2 mt-2 max-w-[68ch] text-[14px] leading-relaxed text-paper-2">
          {item.summary}
        </p>
      )}
    </a>
  )
}
