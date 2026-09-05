import { pct } from '@/lib/format'
import type { StockQuote } from '@/types/stocks'

/**
 * Opacity encodes the size of the move, hue encodes direction. Capped at ±4%
 * so one outlier can't wash out the rest of the board.
 */
function tint(changePercent: number): string {
  const magnitude = Math.min(Math.abs(changePercent) / 4, 1)
  const alpha = 0.1 + magnitude * 0.55
  return changePercent >= 0
    ? `rgba(56, 201, 142, ${alpha.toFixed(3)})`
    : `rgba(240, 90, 82, ${alpha.toFixed(3)})`
}

export default function SectorHeatmap({ quotes }: { quotes: StockQuote[] }) {
  if (quotes.length === 0) return null

  const sectors = Array.from(new Set(quotes.map((q) => q.sector)))

  return (
    <div className="flex flex-col gap-6">
      {sectors.map((sector) => {
        const members = quotes
          .filter((q) => q.sector === sector)
          .sort((a, b) => b.changePercent - a.changePercent)

        const avg = members.reduce((sum, q) => sum + q.changePercent, 0) / members.length

        return (
          <section key={sector} aria-label={`${sector} sector`}>
            <div className="mb-2.5 flex items-baseline justify-between gap-3">
              <h3 className="eyebrow">{sector}</h3>
              <span
                className="num text-xs"
                style={{ color: avg >= 0 ? 'var(--pos)' : 'var(--neg)' }}
              >
                {pct(avg)} avg
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
              {members.map((q) => (
                <div
                  key={q.symbol}
                  className="flex flex-col justify-between gap-2 rounded-sm border border-hair p-3"
                  style={{ background: tint(q.changePercent) }}
                >
                  <p className="num text-xs font-medium text-paper">{q.symbol}</p>
                  <p className="num text-sm text-paper">{pct(q.changePercent)}</p>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
