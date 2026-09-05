import { getAllEpisodes, getAllCategories } from '@/lib/episodes'
import { getCachedNews } from '@/lib/news'
import EpisodeGrid from '@/components/EpisodeGrid'
import CategoryTabs from '@/components/CategoryTabs'
import NewsReadout from '@/components/NewsReadout'
import MountainHero from '@/components/MountainHero'
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
    <main className="colorado-site">
      <MountainHero latestEpisode={latestEpisode} />

      <section id="news" className="dashboard-section dashboard-section--first">
        <div className="dashboard-heading">
          <div>
            <span className="section-eyebrow">01 · Live intelligence</span>
            <h2>Technology signal</h2>
          </div>
          <p>Fresh headlines and market context, collected into one calm view.</p>
        </div>

        <div className="mountain-panel mountain-panel--news">
          <NewsReadout compact initialItems={newsItems} />
        </div>
        <div className="mountain-panel mountain-panel--ticker">
          <StockTicker />
        </div>
      </section>

      <section id="archive" className="dashboard-section dashboard-section--archive">
        <div className="dashboard-heading dashboard-heading--archive">
          <div>
            <span className="section-eyebrow">02 · Listening archive</span>
            <h2>Podcasts worth keeping</h2>
          </div>
          <p>A curated archive of episodes on technology, AI, systems, leadership, and the ideas around them.</p>
        </div>

        <div className="mountain-panel mountain-panel--archive">
          <div className="archive-toolbar">
            <span>{episodes.length} episodes</span>
            {categories.length > 0 && (
              <CategoryTabs categories={categories} selected={selectedCategory} />
            )}
          </div>
          <EpisodeGrid episodes={episodes} selectedCategory={selectedCategory} />
        </div>
      </section>

      <section className="trail-break" aria-label="Colorado landscape">
        <div>
          <span className="section-eyebrow">Field note · Colorado</span>
          <p>Good systems create room to look up.</p>
        </div>
      </section>
    </main>
  )
}
