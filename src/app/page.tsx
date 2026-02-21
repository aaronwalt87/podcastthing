import { getAllEpisodes } from '@/lib/episodes'
import EpisodeGrid from '@/components/EpisodeGrid'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const episodes = await getAllEpisodes()

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-10">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Podcast Showcase
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          A curated collection of favorite episodes.
        </p>
      </header>

      {/* Episode grid */}
      <EpisodeGrid episodes={episodes} />
    </main>
  )
}
