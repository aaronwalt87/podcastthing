'use client'

import { usePlayer } from '@/context/PlayerContext'
import type { Episode } from '@/types/episode'

interface EpisodeCardProps {
  episode: Episode
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const { currentEpisode, isPlaying, play, pause, resume } = usePlayer()

  const isActive = currentEpisode?.id === episode.id
  const isThisPlaying = isActive && isPlaying

  const handleClick = () => {
    if (isActive) {
      isPlaying ? pause() : resume()
    } else {
      play(episode)
    }
  }

  return (
    <div
      className="group relative flex flex-col cursor-pointer select-none"
      style={{
        background: isActive ? '#f5ead8' : '#d4c4a0',
        border: isActive ? '2px solid #cc2010' : '2px solid #a09060',
        borderBottom: isActive ? '4px solid #8b1508' : '4px solid #7a6840',
        boxShadow: isActive ? '2px 2px 0 #8b1508' : '2px 2px 0 #7a6840',
        transition: 'border-color 0.1s, box-shadow 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = '#8a6a40'
          el.style.borderBottomColor = '#6a5020'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          const el = e.currentTarget as HTMLDivElement
          el.style.border = '2px solid #a09060'
          el.style.borderBottom = '4px solid #7a6840'
        }
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${episode.title}`}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-square overflow-hidden" style={{ background: '#2a1e10' }}>
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="w-full h-full object-cover"
            style={{ opacity: isActive ? 1 : 0.88 }}
          />
        ) : (
          /* Pixel-style cassette placeholder */
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #c4b488 0%, #b0a070 100%)' }}
          >
            <svg viewBox="0 0 80 56" className="w-3/5" fill="none">
              <rect x="2" y="2" width="76" height="52" rx="4" fill="#d4c4a0" stroke="#8a7040" strokeWidth="2"/>
              <rect x="14" y="18" width="52" height="22" rx="2" fill="#1a1208" stroke="#6a5020" strokeWidth="1.5"/>
              <circle cx="28" cy="29" r="7" stroke="#c4b080" strokeWidth="1.5" fill="#0e0a05"/>
              <circle cx="28" cy="29" r="2.5" stroke="#d4c090" strokeWidth="1" fill="#080603"/>
              <circle cx="52" cy="29" r="7" stroke="#c4b080" strokeWidth="1.5" fill="#0e0a05"/>
              <circle cx="52" cy="29" r="2.5" stroke="#d4c090" strokeWidth="1" fill="#080603"/>
              <path d="M35 29 Q40 32 45 29" stroke="#cc2010" strokeWidth="2" fill="none"/>
              <rect x="4" y="44" width="8" height="6" rx="1" fill="#cc2010" stroke="#8b1508" strokeWidth="1"/>
              <rect x="68" y="44" width="8" height="6" rx="1" fill="#cc2010" stroke="#8b1508" strokeWidth="1"/>
            </svg>
          </div>
        )}

        {/* Play/pause overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              background: '#cc2010',
              border: '2px solid #f5ead8',
              boxShadow: '0 2px 0 #8b1508',
            }}
          >
            {isThisPlaying ? (
              <svg className="w-5 h-5" fill="#f5ead8" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="#f5ead8" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </div>
        </div>

        {/* NOW PLAYING badge */}
        {isActive && (
          <div
            className="absolute top-0 left-0 px-1.5 py-0.5 text-xs font-mono font-bold tracking-wider"
            style={{ background: '#cc2010', color: '#f5ead8' }}
          >
            {isThisPlaying ? '▶ PLAYING' : '❙❙ PAUSED'}
          </div>
        )}
      </div>

      {/* Info area — looks like cassette label */}
      <div
        className="flex-1 flex flex-col gap-1 p-2 sm:p-3"
        style={{
          background: isActive ? '#f5ead8' : '#e8d8b8',
          borderTop: '1px solid #c0a878',
        }}
      >
        <p className="text-xs font-mono uppercase tracking-widest truncate" style={{ color: '#8a6030' }}>
          {episode.showName}
        </p>
        <p className="text-xs sm:text-sm font-mono font-bold leading-snug line-clamp-2" style={{ color: '#2a1e10' }}>
          {episode.title}
        </p>
        {episode.category && (
          <span
            className="self-start mt-auto text-xs font-mono px-1.5 py-px tracking-wider"
            style={{ background: '#c4b080', color: '#2a1e10', border: '1px solid #a09060' }}
          >
            {episode.category}
          </span>
        )}
      </div>
    </div>
  )
}
