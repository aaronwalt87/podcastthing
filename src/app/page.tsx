import Image from 'next/image'
import { getAllEpisodes, getAllCategories } from '@/lib/episodes'
import EpisodeGrid from '@/components/EpisodeGrid'
import CategoryTabs from '@/components/CategoryTabs'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: { category?: string }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [allEpisodes, categories] = await Promise.all([
    getAllEpisodes(),
    getAllCategories(),
  ])

  const selectedCategory = searchParams.category
  const episodes = selectedCategory
    ? allEpisodes.filter((ep) => ep.category === selectedCategory)
    : allEpisodes

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-10">
      <header className="mb-12">
        {/* Status bar */}
        <div
          className="flex items-center justify-between mb-6 text-xs uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1', opacity: 0.8 }}
        >
          <span>SYS:ONLINE <span className="blink" style={{ color: '#FF3B3B', opacity: 1 }}>▮</span></span>
          <span style={{ color: '#FF3B3B', opacity: 1 }}>[ BROADCAST READY ]</span>
          <span>VER 2.0</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Logo — tonal container, ambient shadow */}
          <div
            className="relative flex-shrink-0 p-1"
            style={{ background: '#1c1b1b', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
          >
            <Image
              src="/logo.svg"
              alt="Podcast Showcase"
              width={88}
              height={88}
              className="block"
              priority
            />
          </div>

          <div>
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1', opacity: 0.7 }}
            >
              {'// SYSTEM AUDIO ARCHIVE'}
            </p>
            <h1
              className="text-4xl font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e5e2e1' }}
            >
              PODCAST
              <span style={{ color: '#FF3B3B', textShadow: '0 0 4px rgba(255,59,59,0.3)' }}>_</span>
              SHOWCASE
            </h1>
            <p
              className="text-sm mt-2 tracking-widest uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1' }}
            >
              ◆ CURATED EPISODE ARCHIVE ◆
            </p>
          </div>
        </div>
      </header>

      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryTabs categories={categories} selected={selectedCategory} />
        </div>
      )}

      <EpisodeGrid episodes={episodes} selectedCategory={selectedCategory} />
    </main>
  )
}
