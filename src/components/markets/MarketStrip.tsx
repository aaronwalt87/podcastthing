import Link from 'next/link'
import { num } from '@/lib/format'
import { MARKET_STATE_LABEL } from '@/lib/stocks'
import type { MarketSnapshot } from '@/types/stocks'

interface MarketStripProps {
  snapshot: MarketSnapshot
}

function Tick({ symbol, price, changePercent }: { symbol: string; price: number; changePercent: number }) {
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
 * seamlessly at -50%; the duplicate is hidden from assistive tech, and the whole
 * strip is summarised in text for screen readers.
 */
export default function MarketStrip({ snapshot }: MarketStripProps) {
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

        <div className="marquee-viewport relative flex-1 overflow-hidden py-2.5">
          <div
            className="marquee"
            style={{ ['--marquee-duration' as string]: `${durationSeconds}s` }}
          >
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex"
                aria-hidden={copy === 1 ? 'true' : undefined}
              >
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
