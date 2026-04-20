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
            <p className="text-sm tracking-widest uppercase" style={{ color: '#00FF41', fontFamily: "'Space Grotesk', sans-serif" }}>
              NO SIGNAL IN &ldquo;{selectedCategory}&rdquo;
            </p>
            <p className="text-xs mt-2 tracking-wider uppercase" style={{ color: '#b9ccb2', opacity: 0.5, fontFamily: "'Space Grotesk', sans-serif" }}>
              TRY DIFFERENT FREQUENCY
            </p>
          </>
        ) : (
          <>
            <p className="text-sm tracking-widest uppercase" style={{ color: '#00FF41', fontFamily: "'Space Grotesk', sans-serif" }}>
              ARCHIVE EMPTY
            </p>
            <p className="text-xs mt-2 tracking-wider uppercase" style={{ color: '#b9ccb2', opacity: 0.5, fontFamily: "'Space Grotesk', sans-serif" }}>
              ACCESS{' '}
              <a href="/admin" style={{ color: '#00FF41' }} className="hover:opacity-80 transition-opacity">
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
        {episodes.map((ep) => (
          <EpisodeCard key={ep.id} episode={ep} />
        ))}
      </div>
    </div>
  )
}
