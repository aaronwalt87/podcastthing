'use client'

import Link from 'next/link'
import { useState } from 'react'
import { num } from '@/lib/format'
import { MARKET_STATE_LABEL } from '@/types/stocks'
import type { MarketSnapshot } from '@/types/stocks'

interface MarketStripProps {
  snapshot: MarketSnapshot
}

function Tick({
  symbol,
  price,
  changePercent,
}: {
  symbol: string
  price: number
  changePercent: number
}) {
  const up = changePercent >= 0
  return (
    <span className="flex items-center gap-2 whitespace-nowrap px-5 text-xs">
      <span className="num font-medium tracking-wide text-paper">{symbol}</span>
      <span className="num text-paper-2">{num(price)}</span>
      <span className="num" style={{ color: up ? 'var(--pos)' : 'var(--neg)' }}>
        {up ? '+' : ''}
        {num(changePercent)}%
      </span>
      <span aria-hidden="true" className="ml-3 h-3 w-px bg-hair-2" />
    </span>
  )
}

/**
 * Continuous market tape. The list is duplicated so the CSS marquee can loop
 * seamlessly at -50%; the duplicate is hidden from assistive tech.
 *
 * WCAG 2.2.2 requires a mechanism to stop motion that runs longer than five
 * seconds, and hover alone does not qualify — there is nothing to hover with on
 * a touch device and nothing focusable inside the tape, so the button is the
 * only real control.
 */
export default function MarketStrip({ snapshot }: MarketStripProps) {
  const [paused, setPaused] = useState(false)
  const { quotes, marketState } = snapshot

  if (quotes.length === 0) return null

  const live = marketState === 'REGULAR'
  // Longer tapes need proportionally longer loops to keep a constant speed.
  const durationSeconds = Math.max(40, quotes.length * 5)

  return (
    <div className="border-y border-hair bg-ink-950/70">
      <div className="flex items-stretch">
        <div className="hidden shrink-0 items-center gap-2 border-r border-hair px-4 sm:flex">
          <span className={live ? 'pulse' : 'pulse pulse-idle'} aria-hidden="true" />
          <span className="eyebrow">{MARKET_STATE_LABEL[marketState]}</span>
        </div>

        <div
          className="marquee-viewport relative flex-1 overflow-hidden py-2.5"
          data-paused={paused ? 'true' : 'false'}
        >
          <div
            className="marquee"
            style={{ ['--marquee-duration' as string]: `${durationSeconds}s` }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex" aria-hidden={copy === 1 ? 'true' : undefined}>
                {quotes.map((q) => (
                  <Tick
                    key={`${copy}-${q.symbol}`}
                    symbol={q.symbol}
                    price={q.price}
                    changePercent={q.changePercent}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Edge fades so ticks dissolve rather than clip */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-16"
            style={{ background: 'linear-gradient(90deg, var(--ink-950), transparent)' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-16"
            style={{ background: 'linear-gradient(270deg, var(--ink-950), transparent)' }}
          />
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          // Fixed label: aria-pressed already carries the state, and flipping
          // both makes a screen reader announce it twice, contradictorily.
          aria-label="Pause the market tape"
          className="flex shrink-0 items-center border-l border-hair px-3.5 text-paper-3 transition-colors hover:text-paper"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {paused ? (
              <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.1-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
            ) : (
              <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
            )}
          </svg>
        </button>

        <Link
          href="/markets"
          className="hidden shrink-0 items-center border-l border-hair px-4 text-xs text-paper-2 transition-colors hover:text-paper sm:flex"
        >
          Markets <span aria-hidden="true" className="ml-1.5">→</span>
        </Link>
      </div>
    </div>
  )
}
