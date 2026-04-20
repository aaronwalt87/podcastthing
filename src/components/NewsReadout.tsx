'use client'

import Link from 'next/link'
import type { NewsItem, NewsCategory } from '@/types/news'

interface NewsReadoutProps {
  initialItems: NewsItem[]
  compact?: boolean
}

const CATEGORY_ORDER: NewsCategory[] = ['AI', 'Misc', 'Hardware', 'IT', 'Finance']

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  AI:       'AI_FEED',
  Misc:     'MISC_TECH',
  Hardware: 'HARDWARE',
  IT:       'IT_SYSADMIN',
  Finance:  'TECH_FINANCE',
}

function formatTime(ms: number): string {
  const d = new Date(ms)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function formatAge(ms: number): string {
  const diff = Date.now() - ms
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 1) return 'JUST NOW'
  if (hours < 1) return `${minutes}M AGO`
  if (days < 1) return `${hours}H AGO`
  return `${days}D AGO`
}

function NewsRow({ item, last }: { item: NewsItem; last: boolean }) {
  return (
    <div style={{ borderBottom: !last ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-3 py-2.5 group"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs tabular-nums flex-shrink-0" style={{ color: 'rgba(0,255,65,0.6)' }}>
            [{formatTime(item.publishedAt)}]
          </span>
          <span
            className="text-xs uppercase tracking-wider px-1 flex-shrink-0"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: 'rgba(0,255,65,0.06)',
              borderLeft: `1px solid ${item.sourceType === 'social' ? 'rgba(0,255,65,0.6)' : 'rgba(0,255,65,0.3)'}`,
              color: '#00FF41',
              fontSize: '9px',
            }}
          >
            {item.source}
          </span>
          <span className="font-mono text-xs flex-shrink-0 ml-auto" style={{ color: 'rgba(185,204,178,0.4)', fontSize: '9px' }}>
            {formatAge(item.publishedAt)}
          </span>
        </div>
        <p
          className="text-xs leading-snug line-clamp-2 transition-colors duration-150"
          style={{ color: 'var(--text-primary)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLParagraphElement).style.color = 'var(--text-accent)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLParagraphElement).style.color = 'var(--text-primary)' }}
        >
          {item.title}
        </p>
      </a>
    </div>
  )
}

function CategorySection({ label, items }: { label: string; items: NewsItem[] }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Section header */}
      <div
        className="flex items-center gap-3 px-3 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,255,65,0.03)' }}
      >
        <span
          className="text-xs uppercase tracking-widest font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00FF41' }}
        >
          {'>> '}{label}
        </span>
        <span
          className="font-mono text-xs ml-auto"
          style={{ color: 'rgba(0,255,65,0.4)', fontSize: '10px' }}
        >
          {items.length} ITEMS
        </span>
      </div>

      {/* 2-col grid of items */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={i % 2 === 0 ? 'lg:border-r' : ''}
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <NewsRow item={item} last={i === items.length - 1 || i === items.length - 2} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NewsReadout({ initialItems, compact = false }: NewsReadoutProps) {
  // Compact: interleave 2 newest per category for source diversity (60/40 spread)
  const items = compact
    ? (() => {
        const perCat = CATEGORY_ORDER.flatMap((cat) =>
          initialItems.filter((i) => i.category === cat).slice(0, 2)
        )
        const seen = new Set(perCat.map((i) => i.id))
        const filler = initialItems.filter((i) => !seen.has(i.id)).slice(0, 10 - perCat.length)
        return [...perCat, ...filler].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 10)
      })()
    : initialItems.slice(0, 60)

  return (
    <div
      className="glass flex flex-col rounded-lg overflow-hidden"
      style={{ borderLeft: '2px solid rgba(0,255,65,0.5)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00FF41' }}
        >
          LIVE_TELEMETRY_
        </span>
        <span className="blink text-xs" style={{ color: '#00FF41' }}>▮</span>
        {compact && (
          <Link
            href="/terminal"
            className="ml-auto text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00FF41', opacity: 0.5, fontSize: '10px' }}
          >
            VIEW_ALL →
          </Link>
        )}
      </div>

      {/* Feed */}
      {items.length === 0 ? (
        <div className="px-3 py-4">
          <span
            className="text-xs uppercase tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00FF41', opacity: 0.5 }}
          >
            FEED OFFLINE — SIGNAL LOST <span className="blink">▮</span>
          </span>
        </div>
      ) : compact ? (
        <>
          <div className="overflow-y-auto" style={{ maxHeight: '14rem' }}>
            {items.map((item, i) => (
              <NewsRow key={item.id} item={item} last={i === items.length - 1} />
            ))}
          </div>
          <Link
            href="/terminal"
            className="flex items-center justify-center gap-2 px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-150 flex-shrink-0"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'rgba(0,255,65,0.5)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#00FF41' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(0,255,65,0.5)' }}
          >
            VIEW ALL {initialItems.length} SIGNALS →
          </Link>
        </>
      ) : (
        /* Full mode: stacked category sections */
        <div>
          {CATEGORY_ORDER
            .map((cat) => ({ cat, catItems: items.filter((i) => i.category === cat) }))
            .filter(({ catItems }) => catItems.length > 0)
            .map(({ cat, catItems }) => (
              <CategorySection key={cat} label={CATEGORY_LABELS[cat]} items={catItems} />
            ))
          }
        </div>
      )}
    </div>
  )
}
