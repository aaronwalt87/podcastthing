import { sampleDataEnabled } from '@/lib/sample-data'
import { isRedisConfigured } from '@/lib/redis'

/**
 * Renders only in local development with no store configured — the exact
 * condition under which the site serves fixtures. It exists so a screenshot or
 * a shared screen can never present invented headlines as live data.
 */
export default function DevDataBanner() {
  if (!sampleDataEnabled() || isRedisConfigured()) return null

  return (
    // Static, not fixed: a floating banner would sit over anything that
    // scroll-padding-top brought into view, and would paint over the palette.
    <div
      className="border-b border-hair px-4 py-1.5 text-center"
      style={{ marginTop: 'var(--header-h)', background: 'var(--ink-900)' }}
    >
      <span className="eyebrow" style={{ color: 'var(--warn-text)' }}>
        Local development · sample data
      </span>{' '}
      <span className="text-[11px] text-paper-3">
        News, market and episode data across this site are fixtures — publisher names are
        placeholders and the headlines are invented.
      </span>
    </div>
  )
}
