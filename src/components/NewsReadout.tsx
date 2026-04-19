'use client'

import { useState, useEffect } from 'react'
import type { NewsItem } from '@/types/news'

interface NewsReadoutProps {
  initialItems: NewsItem[]
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

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function NewsReadout({ initialItems }: NewsReadoutProps) {
  const [items] = useState<NewsItem[]>(initialItems)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const goTo = (next: number) => {
    setVisible(false)
    setTimeout(() => {
      setIndex(next)
      setVisible(true)
    }, 300)
  }

  useEffect(() => {
    if (items.length <= 1) return
    const t = setInterval(() => {
      goTo((index + 1) % items.length)
    }, 6000)
    return () => clearInterval(t)
  }, [index, items.length])

  if (items.length === 0) {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: '#1c1b1b', borderLeft: '2px solid #FF3B3B' }}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF3B3B' }}
        >
          [INTEL FEED]
        </span>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1', opacity: 0.5 }}
        >
          FEED OFFLINE — SIGNAL LOST <span className="blink">▮</span>
        </span>
      </div>
    )
  }

  const item = items[index]

  return (
    <div
      style={{ background: '#1c1b1b', borderLeft: '2px solid #FF3B3B', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}
    >
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-2"
        style={{ borderBottom: '1px solid rgba(53,53,52,0.8)' }}
      >
        <span
          className="text-xs uppercase tracking-widest flex-shrink-0"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF3B3B' }}
        >
          [INTEL FEED]
        </span>

        {/* Source chip */}
        <span
          className="text-xs uppercase tracking-wider px-1.5 py-0.5 flex-shrink-0"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: '#353534',
            borderLeft: `1px solid ${item.sourceType === 'social' ? '#FF3B3B' : '#67d7e1'}`,
            color: item.sourceType === 'social' ? '#ffb3ac' : '#67d7e1',
          }}
        >
          {item.source}
        </span>

        <span className="blink text-xs flex-shrink-0" style={{ color: '#FF3B3B' }}>▮</span>

        <div className="flex-1" />

        {/* Counter */}
        <span
          className="text-xs tabular-nums flex-shrink-0"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e5e2e1', opacity: 0.35 }}
        >
          {pad(index + 1)}/{pad(items.length)}
        </span>

        {/* Prev / Next */}
        <button
          onClick={() => goTo((index - 1 + items.length) % items.length)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors"
          style={{ background: '#353534', color: '#e5e2e1' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#67d7e1' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#e5e2e1' }}
          aria-label="Previous"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M7 1L3 5l4 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
        <button
          onClick={() => goTo((index + 1) % items.length)}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors"
          style={{ background: '#353534', color: '#e5e2e1' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#67d7e1' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#e5e2e1' }}
          aria-label="Next"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div
        className="px-4 py-3"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
      >
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
          <p
            className="text-sm font-medium leading-snug group-hover:opacity-80 transition-opacity"
            style={{ color: '#e5e2e1' }}
          >
            {item.title}
          </p>
          {item.summary && (
            <p
              className="text-xs mt-1 line-clamp-1"
              style={{ color: '#e5e2e1', opacity: 0.4 }}
            >
              {item.summary}
            </p>
          )}
        </a>
        <p
          className="text-xs mt-2 uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1', opacity: 0.6 }}
        >
          {formatAge(item.publishedAt)}
        </p>
      </div>
    </div>
  )
}
