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
    <div
      role="status"
      className="fixed inset-x-0 z-[130] border-b px-4 py-1.5 text-center text-[11px] leading-tight"
      style={{
        top: 'var(--header-h)',
        background: 'var(--warn-ghost)',
        borderColor: 'var(--warn-edge)',
        color: 'var(--warn-text)',
      }}
    >
      <strong>Local development — sample data.</strong> Headlines, quotes and episodes on this page
      are fixtures. Publisher names are placeholders and the stories are invented.
    </div>
  )
}
