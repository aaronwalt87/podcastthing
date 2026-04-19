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
          <rect x="4" y="14" width="40" height="24" stroke="#353534" strokeWidth="1.5" fill="#1c1b1b"/>
          <rect x="10" y="22" width="28" height="10" stroke="#353534" strokeWidth="1" fill="#131313"/>
          <circle cx="17" cy="27" r="5" stroke="#67d7e1" strokeWidth="1.5" fill="#1c1b1b" strokeOpacity="0.5"/>
          <circle cx="17" cy="27" r="2" stroke="#67d7e1" strokeWidth="1" fill="#131313" strokeOpacity="0.5"/>
          <circle cx="31" cy="27" r="5" stroke="#67d7e1" strokeWidth="1.5" fill="#1c1b1b" strokeOpacity="0.5"/>
          <circle cx="31" cy="27" r="2" stroke="#67d7e1" strokeWidth="1" fill="#131313" strokeOpacity="0.5"/>
          <path d="M22 27 Q24 29 26 27" stroke="#FF3B3B" strokeWidth="1.5" fill="none"/>
        </svg>
        {selectedCategory ? (
          <>
            <p
              className="text-sm tracking-widest uppercase"
              style={{ color: '#67d7e1', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              NO SIGNAL IN &ldquo;{selectedCategory}&rdquo;
            </p>
            <p
              className="text-xs mt-2 tracking-wider uppercase"
              style={{ color: '#e5e2e1', opacity: 0.4, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              TRY DIFFERENT FREQUENCY
            </p>
          </>
        ) : (
          <>
            <p
              className="text-sm tracking-widest uppercase"
              style={{ color: '#67d7e1', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ARCHIVE EMPTY
            </p>
            <p
              className="text-xs mt-2 tracking-wider uppercase"
              style={{ color: '#e5e2e1', opacity: 0.4, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ACCESS{' '}
              <a href="/admin" style={{ color: '#FF3B3B' }} className="hover:opacity-80 transition-opacity">
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
