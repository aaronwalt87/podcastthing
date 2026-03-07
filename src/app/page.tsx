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
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 blur-md opacity-60" />
            <Image
              src="/logo.png"
              alt="Podcast Showcase"
              width={52}
              height={52}
              className="relative rounded-xl shadow-lg"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent">
              Podcast Showcase
            </h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              A curated collection of favorite episodes.
            </p>
          </div>
        </div>
        <div className="mt-6 h-px bg-gradient-to-r from-violet-500/30 via-indigo-500/20 to-transparent" />
      </header>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryTabs categories={categories} selected={selectedCategory} />
        </div>
      )}

      {/* Episode grid */}
      <EpisodeGrid episodes={episodes} selectedCategory={selectedCategory} />
    </main>
  )
}
