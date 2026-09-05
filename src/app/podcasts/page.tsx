import type { Metadata } from 'next'
import { getAllCategories, getAllEpisodes, getAllShows } from '@/lib/episodes'
import EpisodeArchive from '@/components/podcasts/EpisodeArchive'
import AutoPlayOnLoad from '@/components/podcasts/AutoPlayOnLoad'
import Reveal from '@/components/ui/Reveal'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Podcasts',
  description: 'A curated archive of technology and infrastructure podcast episodes.',
}

interface PodcastsPageProps {
  searchParams: { play?: string }
}

export default async function PodcastsPage({ searchParams }: PodcastsPageProps) {
  const [episodes, categories, shows] = await Promise.all([
    getAllEpisodes(),
    getAllCategories(),
    getAllShows(),
  ])

  const totalShows = shows.length

  return (
    <div className="shell" style={{ paddingTop: 'calc(var(--header-h) + 56px)' }}>
      <AutoPlayOnLoad episodes={episodes} playId={searchParams.play} />

      <header className="max-w-3xl">
        <p className="eyebrow eyebrow-accent">Listening archive</p>
        <h1 className="display mt-4 text-[clamp(38px,6vw,76px)]">Podcasts</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-paper-2">
          {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
          {totalShows > 0 && ` across ${totalShows} ${totalShows === 1 ? 'show' : 'shows'}`}. Search
          the archive, filter it, and pick up any episode where you left off — positions are stored
          in your browser, not on a server.
        </p>
      </header>

      <div className="mt-12 pb-8">
        <Reveal>
          <EpisodeArchive episodes={episodes} categories={categories} shows={shows} />
        </Reveal>
      </div>
    </div>
  )
}
