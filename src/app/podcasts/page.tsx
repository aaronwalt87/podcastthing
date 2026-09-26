import type { Metadata } from 'next'
import { getAllCategories, getAllEpisodes, getAllShows } from '@/lib/episodes'
import EpisodeArchive from '@/components/podcasts/EpisodeArchive'
import AutoPlayOnLoad from '@/components/podcasts/AutoPlayOnLoad'
import Reveal from '@/components/ui/Reveal'
import PageMasthead from '@/components/ui/PageMasthead'
import styles from '@/components/ui/PageMasthead.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Podcasts',
  description: 'Technology and infrastructure podcast episodes that earned their place in the archive.',
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
    <div className={`shell ${styles.page}`}>
      <AutoPlayOnLoad episodes={episodes} playId={searchParams.play} />

      <PageMasthead index="03" eyebrow="The listening archive" title="Podcasts">
        <p>
          {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
          {totalShows > 0 && ` across ${totalShows} ${totalShows === 1 ? 'show' : 'shows'}`}, picked
          one at a time. Browse, filter, and listen. Your place is saved in this browser.
        </p>
      </PageMasthead>

      <div className={styles.body}>
        <Reveal>
          <EpisodeArchive episodes={episodes} categories={categories} shows={shows} />
        </Reveal>
      </div>
    </div>
  )
}
