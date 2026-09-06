import Sparkline from './Sparkline'
import Delta from './Delta'
import Spotlight from '@/components/ui/Spotlight'
import { num, timeAgo } from '@/lib/format'
import type { StockQuote } from '@/types/stocks'

interface QuoteCardProps {
  quote: StockQuote
  /** Larger treatment for index-level tiles. */
  emphasis?: boolean
  /** Stable reference time so the age doesn't shift between SSR and hydration. */
  now?: number
  /** Show where the number came from. Off in dense grids. */
  showSource?: boolean
}

const SOURCE_LABEL: Record<StockQuote['source'], string> = {
  finnhub: 'Live quote',
  stooq: 'End-of-day close',
}

export default function QuoteCard({
  quote,
  emphasis = false,
  now,
  showSource = false,
}: QuoteCardProps) {
  const up = quote.changePercent >= 0

  return (
    <Spotlight className="panel h-full overflow-hidden">
      <div className={`flex h-full flex-col justify-between gap-4 ${emphasis ? 'p-5' : 'p-4'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="num text-[13px] font-medium tracking-wide text-paper">{quote.symbol}</p>
            <p className="truncate text-xs text-paper-3">{quote.name}</p>
          </div>
          <span className="chip shrink-0">{quote.sector}</span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p
              className={`num font-medium tracking-tight text-paper ${
                emphasis ? 'text-3xl' : 'text-2xl'
              }`}
            >
              {num(quote.price)}
            </p>
            <div className="mt-1">
              <Delta changePercent={quote.changePercent} change={quote.change} showAbsolute />
            </div>
          </div>

          <Sparkline
            id={quote.symbol}
            points={quote.history}
            width={emphasis ? 132 : 104}
            height={emphasis ? 44 : 36}
            color={up ? 'var(--pos)' : 'var(--neg)'}
            className="shrink-0"
          />
        </div>

        {showSource && (
          <p className="eyebrow border-t border-hair pt-3">
            {SOURCE_LABEL[quote.source]}
            {now !== undefined && quote.updatedAt > 0 && ` · ${timeAgo(quote.updatedAt, now)} ago`}
          </p>
        )}
      </div>
    </Spotlight>
  )
}
