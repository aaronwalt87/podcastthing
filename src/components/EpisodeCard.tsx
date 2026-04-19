'use client'

import { usePlayer } from '@/context/PlayerContext'
import type { Episode } from '@/types/episode'

interface EpisodeCardProps {
  episode: Episode
  featured?: boolean
}

function formatDate(ms: number): string {
  const d = new Date(ms)
  const yyyy = d.getFullYear()
  const mm = (d.getMonth() + 1).toString().padStart(2, '0')
  const dd = d.getDate().toString().padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

export default function EpisodeCard({ episode, featured = false }: EpisodeCardProps) {
  const { currentEpisode, isPlaying, play, pause, resume } = usePlayer()

  const isCurrentEpisode = currentEpisode?.id === episode.id
  const isThisPlaying = isCurrentEpisode && isPlaying

  const handleClick = () => {
    if (isCurrentEpisode) {
      isPlaying ? pause() : resume()
    } else {
      play(episode)
    }
  }

  return (
    <div
      className="group relative flex flex-col overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: isCurrentEpisode ? '#353534' : '#1c1b1b',
        boxShadow: isCurrentEpisode
          ? '0 0 20px rgba(255,59,59,0.15), 0 20px 50px rgba(0,0,0,0.5)'
          : '0 20px 50px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => {
        if (!isCurrentEpisode) (e.currentTarget as HTMLDivElement).style.background = '#222220'
      }}
      onMouseLeave={(e) => {
        if (!isCurrentEpisode) (e.currentTarget as HTMLDivElement).style.background = '#1c1b1b'
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${episode.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video" style={{ background: '#131313' }}>
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="14" width="40" height="24" stroke="#353534" strokeWidth="1.5" fill="#1c1b1b"/>
              <rect x="10" y="22" width="28" height="10" stroke="#353534" strokeWidth="1" fill="#131313"/>
              <circle cx="17" cy="27" r="5" stroke="#67d7e1" strokeWidth="1.5" fill="#1c1b1b" strokeOpacity="0.5"/>
              <circle cx="17" cy="27" r="2" stroke="#67d7e1" strokeWidth="1" fill="#131313" strokeOpacity="0.5"/>
              <circle cx="31" cy="27" r="5" stroke="#67d7e1" strokeWidth="1.5" fill="#1c1b1b" strokeOpacity="0.5"/>
              <circle cx="31" cy="27" r="2" stroke="#67d7e1" strokeWidth="1" fill="#131313" strokeOpacity="0.5"/>
              <path d="M22 27 Q24 29 26 27" stroke="#FF3B3B" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        )}

        {/* Play/pause overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{ background: '#FF3B3B', boxShadow: '0 0 14px rgba(255,59,59,0.5)' }}
          >
            {isThisPlaying ? (
              <svg className="w-5 h-5" fill="#410003" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="#410003" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* VU bars */}
        {isCurrentEpisode && (
          <div className="absolute top-2 right-2 flex gap-0.5 items-end h-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={isThisPlaying ? 'animate-bounce' : ''}
                style={{
                  width: 3,
                  height: `${[55, 100, 70, 85][i - 1]}%`,
                  background: isThisPlaying ? '#FF3B3B' : '#353534',
                  boxShadow: isThisPlaying ? '0 0 4px rgba(255,59,59,0.8)' : undefined,
                  animationDelay: `${(i - 1) * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Active bottom line */}
        {isCurrentEpisode && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: '#FF3B3B', boxShadow: '0 0 6px rgba(255,59,59,0.9)' }}
          />
        )}
      </div>

      {/* Metadata */}
      <div className={`flex flex-col gap-1.5 flex-1 ${featured ? 'p-4' : 'p-3'}`}>
        {/* Category + date row */}
        <div className="flex items-center justify-between gap-2">
          {episode.category ? (
            <span
              className="text-xs px-1.5 py-0.5 tracking-wider uppercase flex-shrink-0"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: '#353534',
                borderLeft: '1px solid #67d7e1',
                color: '#67d7e1',
                fontSize: '9px',
              }}
            >
              {episode.category}
            </span>
          ) : (
            <span />
          )}
          <span
            className="font-mono text-xs tabular-nums flex-shrink-0"
            style={{ color: '#67d7e1', opacity: 0.6, fontSize: '9px' }}
          >
            {formatDate(episode.addedAt)}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold leading-snug line-clamp-2 ${featured ? 'text-base' : 'text-sm'}`}
          style={{ color: '#e5e2e1' }}
        >
          {episode.title}
        </h3>

        {/* Show name */}
        <p
          className="text-xs uppercase tracking-wider truncate"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1', opacity: 0.8 }}
        >
          {episode.showName}
        </p>

        {/* Description */}
        {episode.description && (
          <p className="text-xs line-clamp-1 mt-0.5" style={{ color: '#e5e2e1', opacity: 0.4 }}>
            {episode.description}
          </p>
        )}
      </div>
    </div>
  )
}
