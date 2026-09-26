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
    // The cache holds JSON with a 48h TTL, so a snapshot written by older code
    // can outlive a deploy. Everything else in the data layer degrades to an
    // empty state rather than throwing; this keeps that invariant.
    (quote ? `${quote.symbol} · 60D · ${(SOURCE_LABEL[quote.source] ?? 'unknown').toUpperCase()}` : null)

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          // A mask rather than borders: hard seams would make this read as a
          // container instead of a moment in the page.
          maskImage: 'linear-gradient(180deg, transparent, black 26%, black 74%, transparent)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent, black 26%, black 74%, transparent)',
        }}
      >
        <SignalField series={quote?.history ?? []} variant={variant} />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, var(--ink-950), transparent 20%, transparent 80%, var(--ink-950))',
        }}
      />

      <div className="shell flex h-full flex-wrap items-center justify-between gap-3">
        {/* Both labels get a literal plate: the ridge's visual mass is centred
            too, so anything vertically centred would have the line running
            through the type at some viewport width. */}
        <div className="min-w-0">{children}</div>
        {caption && (
          // The drawing itself is aria-hidden, so the terse visual caption has
          // nothing for a screen reader to attach to. The sr-only sentence
          // carries the same provenance in a form that stands alone.
          <p
            className="eyebrow rounded-xs bg-ink-950 px-2.5 py-1"
            style={{ color: 'var(--paper-3)' }}
          >
            <span aria-hidden="true">{caption}</span>
            <span className="sr-only">
              {quote
                ? `Chart: ${quote.symbol}, 60-day trend, ${SOURCE_LABEL[quote.source] ?? 'unknown'} data.`
                : caption}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}
