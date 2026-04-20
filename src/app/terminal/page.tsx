import { getCachedNews } from '@/lib/news'
import NewsReadout from '@/components/NewsReadout'
import type { NewsCategory } from '@/types/news'

export const dynamic = 'force-dynamic'

const CATEGORY_ORDER: NewsCategory[] = ['AI', 'Misc', 'Hardware', 'IT', 'Finance']
const CATEGORY_SHORT: Record<NewsCategory, string> = {
  AI: 'AI', Misc: 'MISC', Hardware: 'HW', IT: 'IT', Finance: 'FIN',
}

export default async function TerminalPage() {
  const newsItems = await getCachedNews()

  const breakdown = CATEGORY_ORDER
    .map((cat) => ({ cat, count: newsItems.filter((i) => i.category === cat).length }))
    .filter(({ count }) => count > 0)
    .map(({ cat, count }) => `${count} ${CATEGORY_SHORT[cat]}`)
    .join(' · ')

  return (
    <main className="max-w-screen-xl mx-auto px-4 pt-4 pb-16 flex flex-col gap-6">
      {/* Page header */}
      <div
        className="glass rounded-lg px-5 py-4 flex items-center justify-between"
        style={{ borderLeft: '2px solid rgba(0,255,65,0.5)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#fdbb2c' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span
            className="text-xs uppercase tracking-widest font-bold ml-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00FF41' }}
          >
            LIVE_TELEMETRY_ {'// ALL_SIGNALS'}
          </span>
          <span className="blink text-xs" style={{ color: '#00FF41' }}>▮</span>
        </div>
        <span
          className="font-mono text-xs hidden sm:block"
          style={{ color: 'rgba(0,255,65,0.5)', fontSize: '10px' }}
        >
          {breakdown || `${newsItems.length} ITEMS`}
        </span>
      </div>

      {/* Full categorized feed */}
      <NewsReadout initialItems={newsItems} />
    </main>
  )
}
