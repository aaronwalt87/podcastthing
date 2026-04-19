'use client'

import type { NewsItem } from '@/types/news'

interface NewsReadoutProps {
  initialItems: NewsItem[]
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

export default function NewsReadout({ initialItems }: NewsReadoutProps) {
  const items = initialItems.slice(0, 20)

  return (
    <div
      className="flex flex-col"
      style={{ background: '#1c1b1b', borderLeft: '2px solid #FF3B3B' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(53,53,52,0.8)' }}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF3B3B' }}
        >
          LIVE_TELEMETRY_
        </span>
        <span className="blink text-xs" style={{ color: '#FF3B3B' }}>▮</span>
      </div>

      {/* Feed */}
      {items.length === 0 ? (
        <div className="px-3 py-4">
          <span
            className="text-xs uppercase tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1', opacity: 0.5 }}
          >
            FEED OFFLINE — SIGNAL LOST <span className="blink">▮</span>
          </span>
        </div>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.map((item, i) => (
            <div
              key={item.id}
              style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(53,53,52,0.6)' : undefined }}
            >
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2.5 group"
              >
                {/* Timestamp + source */}
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="font-mono text-xs tabular-nums flex-shrink-0"
                    style={{ color: '#67d7e1', opacity: 0.7 }}
                  >
                    [{formatTime(item.publishedAt)}]
                  </span>
                  <span
                    className="text-xs uppercase tracking-wider px-1 flex-shrink-0"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      background: '#353534',
                      borderLeft: `1px solid ${item.sourceType === 'social' ? '#FF3B3B' : '#67d7e1'}`,
                      color: item.sourceType === 'social' ? '#ffb3ac' : '#67d7e1',
                      fontSize: '9px',
                    }}
                  >
                    {item.source}
                  </span>
                  <span
                    className="font-mono text-xs flex-shrink-0 ml-auto"
                    style={{ color: '#67d7e1', opacity: 0.4, fontSize: '9px' }}
                  >
                    {formatAge(item.publishedAt)}
                  </span>
                </div>
                {/* Headline */}
                <p
                  className="text-xs leading-snug line-clamp-2 transition-colors duration-150"
                  style={{ color: '#e5e2e1' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLParagraphElement).style.color = '#67d7e1' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLParagraphElement).style.color = '#e5e2e1' }}
                >
                  {item.title}
                </p>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
