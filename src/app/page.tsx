import { getAllEpisodes, getAllCategories } from '@/lib/episodes'
import { getCachedNews } from '@/lib/news'
import EpisodeGrid from '@/components/EpisodeGrid'
import CategoryTabs from '@/components/CategoryTabs'
import NewsReadout from '@/components/NewsReadout'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: { category?: string }
}

function StatusBar() {
  const now = new Date()
  const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}_UTC`

  return (
    <div
      className="flex items-center justify-between px-3 py-1.5 mb-6"
      style={{ background: '#1c1b1b', borderLeft: '2px solid #FF3B3B' }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1' }}
        >
          STATUS:
        </span>
        <span
          className="text-xs uppercase tracking-widest font-semibold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF3B3B' }}
        >
          SIGNAL_ACTIVE
        </span>
        <span className="blink text-xs" style={{ color: '#FF3B3B' }}>▮</span>
      </div>
      <span
        className="font-mono text-xs tabular-nums hidden sm:block"
        style={{ color: '#67d7e1', opacity: 0.6 }}
      >
        TIMESTAMP: {timestamp}
      </span>
      <span
        className="text-xs tracking-widest"
        style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e5e2e1', opacity: 0.3 }}
      >
        VER 2.0
      </span>
    </div>
  )
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [allEpisodes, categories, newsItems] = await Promise.all([
    getAllEpisodes(),
    getAllCategories(),
    getCachedNews(),
  ])

  const selectedCategory = searchParams.category
  const episodes = selectedCategory
    ? allEpisodes.filter((ep) => ep.category === selectedCategory)
    : allEpisodes

  return (
    <main className="max-w-screen-xl mx-auto px-4 pt-16 pb-28">
      {/* Status bar — full width */}
      <StatusBar />

      {/* Two-column layout: content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Left: episodes */}
        <div className="min-w-0">
          {categories.length > 0 && (
            <div className="mb-6">
              <CategoryTabs categories={categories} selected={selectedCategory} />
            </div>
          )}
          <EpisodeGrid episodes={episodes} selectedCategory={selectedCategory} />
        </div>

        {/* Right: live telemetry sidebar */}
        <div className="lg:sticky lg:top-16 lg:self-start">
          <NewsReadout initialItems={newsItems} />
        </div>
      </div>
    </main>
  )
}
