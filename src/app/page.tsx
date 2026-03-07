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
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-1">
          <Image
            src="/logo.png"
            alt="Podcast Showcase"
            width={48}
            height={48}
            className="rounded-lg"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Podcast Showcase
            </h1>
            <p className="text-neutral-500 text-sm">
              A curated collection of favorite episodes.
            </p>
          </div>
        </div>
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
