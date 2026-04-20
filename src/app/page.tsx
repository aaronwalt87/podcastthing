import { getAllEpisodes, getAllCategories } from '@/lib/episodes'
import { getCachedNews } from '@/lib/news'
import EpisodeGrid from '@/components/EpisodeGrid'
import CategoryTabs from '@/components/CategoryTabs'
import NewsReadout from '@/components/NewsReadout'
import TerminalHero from '@/components/TerminalHero'
import StockTicker from '@/components/StockTicker'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: { category?: string }
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

  const latestEpisode = allEpisodes[0] ?? null

  return (
    <main className="max-w-screen-xl mx-auto px-4 pt-4 pb-16 flex flex-col gap-6">
      {/* Hero */}
      <TerminalHero latestEpisode={latestEpisode} />

      {/* News strip — full width, compact */}
      <NewsReadout compact initialItems={newsItems} />

      {/* Market feed */}
      <StockTicker />

      {/* Episodes — full width */}
      <div
        id="archive"
        className="glass rounded-lg overflow-hidden"
        style={{ borderLeft: '2px solid rgba(0,255,65,0.5)' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <span
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00FF41' }}
          >
            EPISODE_ARCHIVE_
          </span>
          <span className="blink text-xs" style={{ color: '#00FF41' }}>▮</span>
          {categories.length > 0 && (
            <div className="ml-auto">
              <CategoryTabs categories={categories} selected={selectedCategory} />
            </div>
          )}
        </div>
        <div className="p-4">
          <EpisodeGrid episodes={episodes} selectedCategory={selectedCategory} />
        </div>
      </div>
    </main>
  )
}
