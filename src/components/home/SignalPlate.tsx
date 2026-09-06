import SignalField from './SignalField'
import type { StockQuote } from '@/types/stocks'

interface SignalPlateProps {
  /** The instrument being drawn. Null renders the generated layers only. */
  quote: StockQuote | null
  /** Short mono caption placed on the plate. Optional but strongly preferred. */
  label?: string
  variant?: 'hero' | 'band'
  height?: number | string
  /** Content rendered over the plate, aligned to the page shell. */
  children?: React.ReactNode
  className?: string
}

const SOURCE_LABEL: Record<StockQuote['source'], string> = {
  finnhub: 'Live',
  stooq: 'EOD close',
}

/**
 * The site's one authored drawing, framed as an instrument plate.
 *
 * A ridge with no caption is decoration; the same ridge captioned
 * "SPY · 60D · EOD CLOSE" is a readout, and says the drawing means something.
 * Used on the home page twice, on /markets, and on /about, so the thing this
 * site actually made is the thing a visitor recognises.
 */
export default function SignalPlate({
  quote,
  label,
  variant = 'band',
  height = 168,
  children,
  className = '',
}: SignalPlateProps) {
  const caption =
    label ??
    (quote ? `${quote.symbol} · 60D · ${SOURCE_LABEL[quote.source].toUpperCase()}` : null)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          // A mask rather than borders: hard seams would make this read as a
          // container instead of a moment in the page.
          maskImage: 'linear-gradient(180deg, transparent, #000 26%, #000 74%, transparent)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 26%, #000 74%, transparent)',
        }}
      >
        <SignalField series={quote?.history ?? []} variant={variant} />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, var(--ink-950) 0%, rgba(7,8,10,0.28) 10%, rgba(7,8,10,0.28) 90%, var(--ink-950) 100%)',
        }}
      />

      <div className="shell flex h-full items-center justify-between gap-6">
        <div className="min-w-0">{children}</div>
        {caption && (
          <p className="eyebrow shrink-0 whitespace-nowrap" style={{ color: 'var(--paper-3)' }}>
            {caption}
          </p>
        )}
      </div>
    </div>
  )
}
