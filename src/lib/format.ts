/**
 * Shared formatters. Every timestamp, price and duration on the site renders
 * through one of these so the same value never appears in two shapes.
 */

/** 1234.5 -> "1,234.50" */
export function num(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** 2.13 -> "+2.13%" ; -0.4 -> "-0.40%" */
export function pct(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—'
  return `${value >= 0 ? '+' : ''}${num(value, decimals)}%`
}

/** 1.2 -> "+1.20" */
export function signed(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '—'
  return `${value >= 0 ? '+' : ''}${num(value, decimals)}`
}

/** 3725 -> "1:02:05" ; 65 -> "1:05" */
export function duration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return h > 0 ? `${h}:${mm}:${String(s).padStart(2, '0')}` : `${mm}:${String(s).padStart(2, '0')}`
}

/**
 * Relative age, capped at days. Renders identically on server and client for
 * the same input, so callers must pass a stable `now` when hydration matters.
 */
export function timeAgo(ms: number, now = Date.now()): string {
  const diff = now - ms
  if (!Number.isFinite(diff)) return '—'
  if (diff < 0) return 'now'
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(diff / 86_400_000)
  if (days < 30) return `${days}d`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo`
  return `${Math.floor(days / 365)}y`
}

/** 1710000000000 -> "Mar 09, 2024" */
export function longDate(ms: number): string {
  if (!Number.isFinite(ms)) return '—'
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  })
}

/** 1710000000000 -> "2024.03.09" — used where the mono grid needs fixed width */
export function stampDate(ms: number): string {
  if (!Number.isFinite(ms)) return '—'
  const d = new Date(ms)
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('.')
}

/** Compact market cap / volume style figure: 1_240_000 -> "1.24M" */
export function compact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs >= 1e12) return `${num(value / 1e12, 2)}T`
  if (abs >= 1e9) return `${num(value / 1e9, 2)}B`
  if (abs >= 1e6) return `${num(value / 1e6, 2)}M`
  if (abs >= 1e3) return `${num(value / 1e3, 1)}K`
  return num(value, 0)
}
