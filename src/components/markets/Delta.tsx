import { pct, signed } from '@/lib/format'

interface DeltaProps {
  changePercent: number
  change?: number
  size?: 'sm' | 'md'
  /** Show the absolute move alongside the percentage. */
  showAbsolute?: boolean
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
        <span className="opacity-55">{signed(change)}</span>
      )}
    </span>
  )
}
