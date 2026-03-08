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
        <svg className="w-16 h-16 mb-6" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="14" width="40" height="24" rx="2" stroke="#7a5030" strokeWidth="1.5" fill="#0e0803"/>
          <rect x="10" y="22" width="28" height="10" rx="1" stroke="#5a3820" strokeWidth="1" fill="#060401"/>
          <circle cx="17" cy="27" r="5" stroke="#a07040" strokeWidth="1.5" fill="#0e0803"/>
          <circle cx="17" cy="27" r="2" stroke="#c49060" strokeWidth="1" fill="#060401"/>
          <circle cx="31" cy="27" r="5" stroke="#a07040" strokeWidth="1.5" fill="#0e0803"/>
          <circle cx="31" cy="27" r="2" stroke="#c49060" strokeWidth="1" fill="#060401"/>
          <path d="M22 27 Q24 29 26 27" stroke="#cc3020" strokeWidth="1.5" fill="none"/>
        </svg>
        {selectedCategory ? (
          <>
            <p className="text-sm tracking-widest font-mono" style={{ color: '#a07850' }}>
              NO SIGNAL IN &ldquo;{selectedCategory}&rdquo;
            </p>
            <p className="text-xs mt-2 tracking-wider" style={{ color: '#5a3820' }}>
              TRY DIFFERENT FREQUENCY
            </p>
          </>
        ) : (
          <>
            <p className="text-sm tracking-widest font-mono" style={{ color: '#a07850' }}>
              ARCHIVE EMPTY
            </p>
            <p className="text-xs mt-2 tracking-wider" style={{ color: '#5a3820' }}>
              ACCESS{' '}
              <a href="/admin" style={{ color: '#e83020' }} className="hover:opacity-80 transition-opacity">
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
