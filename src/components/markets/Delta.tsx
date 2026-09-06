import { pct, signed } from '@/lib/format'

interface DeltaProps {
  changePercent: number
  change?: number
  size?: 'sm' | 'md'
  /** Show the absolute move alongside the percentage. */
  showAbsolute?: boolean
  /** Hide the absolute move below `sm` — narrow tables cannot afford it. */
  absoluteFrom?: 'always' | 'sm'
}

/**
 * Signed change readout. Colour carries meaning, so the arrow glyph repeats it
 * for anyone who can't distinguish the two hues.
 */
export default function Delta({
  changePercent,
  change,
  size = 'sm',
  showAbsolute = false,
  absoluteFrom = 'always',
}: DeltaProps) {
  const up = changePercent >= 0
  const color = up ? 'var(--pos)' : 'var(--neg)'

  return (
    <span
      className={`num inline-flex items-baseline gap-1.5 ${size === 'md' ? 'text-sm' : 'text-xs'}`}
      style={{ color }}
    >
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      <span>{pct(changePercent)}</span>
      {showAbsolute && change !== undefined && (
        // A token, not opacity: --neg at 55% computes to 2.4:1, which is below
        // AA for what is still a price figure.
        <span className={`text-paper-3 ${absoluteFrom === 'sm' ? 'hidden sm:inline' : ''}`}>
          {signed(change)}
        </span>
      )}
    </span>
  )
}
