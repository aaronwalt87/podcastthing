import { pct } from '@/lib/format'
import type { StockQuote } from '@/types/stocks'

/**
 * Opacity encodes the size of the move, hue encodes direction. Capped at ±4%
 * so one outlier can't wash out the rest of the board.
 */
function tint(changePercent: number): string {
  // Capped at ±2%, not ±4%: a typical session moves well under 2%, and the
  // wider cap compressed every tile into the bottom fifth of the alpha range,
  // so opacity carried almost no signal.
  const magnitude = Math.min(Math.abs(changePercent) / 2, 1)
  // The green tint lightens the tile faster than the red one, so its ceiling is
  // lower: past ~0.60 alpha, --paper on the result drops below 4.5:1.
  const alpha = 0.1 + magnitude * (changePercent >= 0 ? 0.45 : 0.55)
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-4">
              <div className="flex shrink-0 items-baseline justify-between gap-3 sm:w-36 sm:flex-col sm:justify-center sm:gap-1">
                <h3 className="eyebrow">{sector}</h3>
                <span
                  className="num text-xs"
                  style={{ color: avg >= 0 ? 'var(--pos)' : 'var(--neg)' }}
                >
                  {pct(avg)} avg
                </span>
              </div>

              {/* A band rather than a fixed grid: every sector spans the full
                  width, and tile width carries magnitude as a second encoding
                  instead of leaving three-quarters of a row empty. */}
              <div className="flex flex-1 flex-wrap gap-1.5">
                {members.map((q) => (
                  <div
                    key={q.symbol}
                    className="flex min-w-[92px] flex-col justify-between gap-2 rounded-sm border border-hair p-3"
                    // Equal widths: width is the strongest channel in a tiled
                    // layout and would read as position weight, which this is
                    // not. Magnitude is carried by opacity alone, as the
                    // caption says.
                    style={{ background: tint(q.changePercent), flex: '1 1 0%' }}
                  >
                    <p className="num text-xs font-medium text-paper">{q.symbol}</p>
                    <p className="num text-sm text-paper">{pct(q.changePercent)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
