import type { Episode } from '@/types/episode'
import EpisodeCard from './EpisodeCard'

interface EpisodeGridProps {
  episodes: Episode[]
  selectedCategory?: string
}

export default function EpisodeGrid({ episodes, selectedCategory }: EpisodeGridProps) {
  if (episodes.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 sm:py-32 text-center mx-auto"
        style={{ maxWidth: 360 }}
      >
        {/* Cassette icon */}
        <svg viewBox="0 0 120 84" className="w-28 sm:w-36 mb-6" fill="none">
          <rect x="3" y="3" width="114" height="78" rx="6" fill="#c4b488" stroke="#a09060" strokeWidth="3"/>
          <rect x="20" y="26" width="80" height="34" rx="3" fill="#1a1208" stroke="#6a5020" strokeWidth="2"/>
          <circle cx="42" cy="43" r="11" stroke="#c4b080" strokeWidth="2" fill="#0e0a05"/>
          <circle cx="42" cy="43" r="4" stroke="#d4c090" strokeWidth="1.5" fill="#080603"/>
          <circle cx="78" cy="43" r="11" stroke="#c4b080" strokeWidth="2" fill="#0e0a05"/>
          <circle cx="78" cy="43" r="4" stroke="#d4c090" strokeWidth="1.5" fill="#080603"/>
          <path d="M54 43 Q60 48 66 43" stroke="#cc2010" strokeWidth="2.5" fill="none"/>
          <rect x="6"  y="64" width="12" height="9" rx="2" fill="#cc2010" stroke="#8b1508" strokeWidth="1.5"/>
          <rect x="22" y="64" width="12" height="9" rx="2" fill="#cc2010" stroke="#8b1508" strokeWidth="1.5"/>
          <rect x="86" y="64" width="12" height="9" rx="2" fill="#cc2010" stroke="#8b1508" strokeWidth="1.5"/>
          <rect x="102" y="64" width="12" height="9" rx="2" fill="#cc2010" stroke="#8b1508" strokeWidth="1.5"/>
        </svg>

        {selectedCategory ? (
          <>
            <p className="text-sm font-mono font-bold" style={{ color: '#2a1e10' }}>
              No episodes in &ldquo;{selectedCategory}&rdquo;
            </p>
            <p className="text-xs font-mono mt-2" style={{ color: '#8a6a40' }}>
              Try a different category
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-mono font-bold" style={{ color: '#2a1e10' }}>
              Tape deck is empty
            </p>
            <p className="text-xs font-mono mt-2" style={{ color: '#8a6a40' }}>
              Visit{' '}
              <a href="/admin" className="underline" style={{ color: '#cc2010' }}>
                /admin
              </a>{' '}
              to add episodes
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </div>
  )
}
