import type { Episode } from '@/types/episode'
import EpisodeCard from './EpisodeCard'

interface EpisodeGridProps {
  episodes: Episode[]
}

export default function EpisodeGrid({ episodes }: EpisodeGridProps) {
  if (episodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <svg className="w-16 h-16 text-neutral-700 mb-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
        </svg>
        <p className="text-neutral-400 text-lg font-medium">No episodes yet</p>
        <p className="text-neutral-600 text-sm mt-2">
          Head to{' '}
          <a href="/admin" className="text-neutral-400 underline underline-offset-2 hover:text-white transition-colors">
            /admin
          </a>{' '}
          to add your first episode.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  )
}
