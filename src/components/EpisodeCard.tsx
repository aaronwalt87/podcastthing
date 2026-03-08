'use client'

import { usePlayer } from '@/context/PlayerContext'
import type { Episode } from '@/types/episode'

interface EpisodeCardProps {
  episode: Episode
}

export default function EpisodeCard({ episode }: EpisodeCardProps) {
  const { currentEpisode, isPlaying, play, pause, resume } = usePlayer()

  const isCurrentEpisode = currentEpisode?.id === episode.id
  const isThisPlaying = isCurrentEpisode && isPlaying

  const handleClick = () => {
    if (isCurrentEpisode) {
      if (isPlaying) {
        pause()
      } else {
        resume()
      }
    } else {
      play(episode)
    }
  }

  return (
    <div
      className={`
        group relative flex flex-col overflow-hidden cursor-pointer
        transition-all duration-200 rounded-sm
        ${isCurrentEpisode
          ? 'border border-amber-400/70 bg-blue-950/40'
          : 'border border-blue-800/40 hover:border-blue-400/60 bg-blue-950/20 hover:bg-blue-950/40'
        }
      `}
      style={{
        boxShadow: isCurrentEpisode
          ? '0 0 16px rgba(251,191,36,0.25), inset 0 0 20px rgba(251,191,36,0.03)'
          : undefined,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${episode.title}`}
    >
      {/* Corner brackets (top-left, top-right) */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400/50 z-10" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400/50 z-10" />

      {/* Thumbnail */}
      <div className="relative aspect-square bg-blue-950/60">
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%)' }}>
            {/* Cassette tape SVG placeholder */}
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="14" width="40" height="24" rx="2" stroke="#1d4ed8" strokeWidth="1.5" fill="#080f1e"/>
              <rect x="10" y="22" width="28" height="10" rx="1" stroke="#1e40af" strokeWidth="1" fill="#040810"/>
              <circle cx="17" cy="27" r="5" stroke="#2563eb" strokeWidth="1.5" fill="#080f1e"/>
              <circle cx="17" cy="27" r="2" stroke="#3b82f6" strokeWidth="1" fill="#040810"/>
              <circle cx="31" cy="27" r="5" stroke="#2563eb" strokeWidth="1.5" fill="#080f1e"/>
              <circle cx="31" cy="27" r="2" stroke="#3b82f6" strokeWidth="1" fill="#040810"/>
              <path d="M22 27 Q24 29 26 27" stroke="#f59e0b" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        )}

        {/* Play/pause overlay */}
        <div className={`
          absolute inset-0 flex items-center justify-center
          transition-opacity duration-200
          ${isThisPlaying ? 'opacity-100 bg-black/40' : 'opacity-0 group-hover:opacity-100 bg-black/50'}
        `}>
          <div
            className="w-12 h-12 flex items-center justify-center border border-amber-400/80"
            style={{
              background: 'rgba(0,0,0,0.7)',
              boxShadow: '0 0 14px rgba(251,191,36,0.5)',
            }}
          >
            {isThisPlaying ? (
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* Now playing indicator — VU bars */}
        {isCurrentEpisode && (
          <div className="absolute top-2 right-2 flex gap-0.5 items-end h-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 ${isThisPlaying ? 'animate-bounce' : ''}`}
                style={{
                  height: `${[55, 100, 70, 85][i - 1]}%`,
                  background: isThisPlaying ? '#fbbf24' : '#1d4ed8',
                  boxShadow: isThisPlaying ? '0 0 4px rgba(251,191,36,0.8)' : undefined,
                  animationDelay: `${(i - 1) * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Active indicator line at bottom */}
        {isCurrentEpisode && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400"
               style={{ boxShadow: '0 0 6px rgba(251,191,36,0.9)' }} />
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1 flex-1 border-t border-blue-900/40">
        <p className="text-blue-400 text-xs uppercase tracking-widest truncate">
          {episode.showName}
        </p>
        <h3 className="text-blue-100 text-xs font-medium line-clamp-2 leading-snug">
          {episode.title}
        </h3>
        {episode.description && (
          <p className="text-blue-700 text-xs line-clamp-2 mt-0.5">
            {episode.description}
          </p>
        )}
        {episode.category && (
          <span className="self-start mt-1 text-xs px-1.5 py-0 border border-blue-700/50 text-blue-400 tracking-wider">
            {episode.category}
          </span>
        )}
      </div>

      {/* Corner brackets (bottom) */}
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-400/30" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-400/30" />
    </div>
  )
}
