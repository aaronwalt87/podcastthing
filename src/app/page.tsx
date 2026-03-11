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
    <main className="max-w-screen-xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <header className="mb-6 sm:mb-10">
        {/* Beige top bar — like a monitor bezel label */}
        <div
          className="flex items-center gap-3 px-3 sm:px-4 py-2 mb-4 text-xs font-mono"
          style={{
            background: '#c4b488',
            border: '2px solid #a09060',
            borderBottom: '3px solid #8a7840',
          }}
        >
          {/* Power LED */}
          <span
            className="inline-block w-2.5 h-2.5 flex-shrink-0"
            style={{ background: '#cc2010', border: '1px solid #8b1508', boxShadow: '0 0 4px rgba(200,30,10,0.6)' }}
          />
          <span style={{ color: '#2a1e10', letterSpacing: '0.1em' }}>PODCAST SHOWCASE</span>
          <span className="ml-auto hidden sm:block" style={{ color: '#6b5030' }}>v2.0</span>
        </div>

        {/* Main header row */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo */}
          <div
            className="flex-shrink-0 rounded-sm overflow-hidden"
            style={{ border: '2px solid #a09060', boxShadow: '2px 2px 0 #8a7840' }}
          >
            <Image
              src="/logo.svg"
              alt="Aaron's Mix"
              width={80}
              height={80}
              className="block sm:w-24 sm:h-24"
              priority
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight"
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                color: '#2a1e10',
              }}
            >
              Aaron&apos;s Mix
            </h1>
            <p
              className="text-xs sm:text-sm mt-1 tracking-widest"
              style={{ color: '#7a5a30' }}
            >
              Curated podcast episodes
            </p>
            {/* Red underline accent */}
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 w-16 sm:w-24" style={{ background: '#cc2010' }} />
              <div className="h-px flex-1 max-w-xs" style={{ background: '#c0a878' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="mb-5 sm:mb-8 overflow-x-auto pb-1">
          <CategoryTabs categories={categories} selected={selectedCategory} />
        </div>
      )}

      {/* Episode count */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs font-mono" style={{ color: '#8a6a40' }}>
          {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
          {selectedCategory ? ` in "${selectedCategory}"` : ''}
        </span>
        <div className="flex-1 h-px" style={{ background: '#c0a878' }} />
      </div>

      {/* Episode grid */}
      <EpisodeGrid episodes={episodes} selectedCategory={selectedCategory} />
    </main>
  )
}
