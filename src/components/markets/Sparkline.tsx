interface SparklineProps {
  /**
   * Unique within the page — SVG gradient ids share one global namespace, so a
   * duplicate would make every sparkline reuse the first one's fill.
   */
  id: string
  /** Values oldest → newest. */
  points: number[]
  width?: number
  height?: number
  /** Line + fill colour. Defaults to the positive/negative trend colour. */
  color?: string
  className?: string
  /** Draw a soft gradient under the line. */
  fill?: boolean
}

/**
 * Pure-SVG trend line. No charting dependency, no client JS — this renders on
 * the server and ships as markup.
 */
export default function Sparkline({
  id,
  points,
  width = 120,
  height = 32,
  color,
  className,
  fill = true,
}: SparklineProps) {
  if (points.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        aria-hidden="true"
        role="presentation"
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--ink-600)"
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      </svg>
    )
  }

  const min = Math.min(...points)
  const max = Math.max(...points)
  // A flat series would divide by zero; give it a hairline of range instead.
  const range = max - min || Math.abs(max) * 0.001 || 1
  const pad = 2

  const coords = points.map((value, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - pad - ((value - min) / range) * (height - pad * 2)
    return [x, y] as const
  })

  const line = coords.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
  const area = `${line} ${width},${height} 0,${height}`

  const trendUp = points[points.length - 1] >= points[0]
  const stroke = color ?? (trendUp ? 'var(--pos)' : 'var(--neg)')
  const gradientId = `spark-${id}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
      role="presentation"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.24" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={area} fill={`url(#${gradientId})`} />
        </>
      )}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
