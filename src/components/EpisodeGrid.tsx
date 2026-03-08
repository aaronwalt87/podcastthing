import type { Episode } from '@/types/episode'
import EpisodeCard from './EpisodeCard'

interface EpisodeGridProps {
  episodes: Episode[]
  selectedCategory?: string
}

export default function EpisodeGrid({ episodes, selectedCategory }: EpisodeGridProps) {
  if (episodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <svg className="w-16 h-16 text-blue-800 mb-6" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="14" width="40" height="24" rx="2" stroke="#1d4ed8" strokeWidth="1.5" fill="#080f1e"/>
          <rect x="10" y="22" width="28" height="10" rx="1" stroke="#1e40af" strokeWidth="1" fill="#040810"/>
          <circle cx="17" cy="27" r="5" stroke="#2563eb" strokeWidth="1.5" fill="#080f1e"/>
          <circle cx="17" cy="27" r="2" stroke="#3b82f6" strokeWidth="1" fill="#040810"/>
          <circle cx="31" cy="27" r="5" stroke="#2563eb" strokeWidth="1.5" fill="#080f1e"/>
          <circle cx="31" cy="27" r="2" stroke="#3b82f6" strokeWidth="1" fill="#040810"/>
          <path d="M22 27 Q24 29 26 27" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
        </svg>
        {selectedCategory ? (
          <>
            <p className="text-blue-400 text-sm tracking-widest font-mono">NO SIGNAL IN &ldquo;{selectedCategory}&rdquo;</p>
            <p className="text-blue-700 text-xs mt-2 tracking-wider">TRY DIFFERENT FREQUENCY</p>
          </>
        ) : (
          <>
            <p className="text-blue-400 text-sm tracking-widest font-mono">ARCHIVE EMPTY</p>
            <p className="text-blue-700 text-xs mt-2 tracking-wider">
              ACCESS{' '}
              <a href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors">
                /ADMIN
              </a>{' '}
              TO UPLOAD RECORDINGS
            </p>
          </>
        )}
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
