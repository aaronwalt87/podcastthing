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
      className={`group relative flex flex-col overflow-hidden cursor-pointer transition-all duration-200 h-full`}
      style={{
        background: isCurrentEpisode ? 'rgba(0,255,65,0.08)' : 'rgba(20,20,20,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${isCurrentEpisode ? 'rgba(0,255,65,0.3)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isCurrentEpisode
          ? '0 0 20px rgba(0,255,65,0.12), 0 20px 50px rgba(0,0,0,0.5)'
          : '0 20px 50px rgba(0,0,0,0.3)',
      }}
      onMouseEnter={(e) => {
        if (!isCurrentEpisode) (e.currentTarget as HTMLDivElement).style.background = 'rgba(30,30,30,0.9)'
      }}
      onMouseLeave={(e) => {
        if (!isCurrentEpisode) (e.currentTarget as HTMLDivElement).style.background = 'rgba(20,20,20,0.82)'
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${episode.title}`}
    >
      {/* Thumbnail — fills available height when featured, fixed 16:9 otherwise */}
      <div
        className={featured ? 'relative flex-1 overflow-hidden' : 'relative aspect-video'}
        style={{ background: '#131313', minHeight: featured ? '200px' : undefined }}
      >
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
            style={{ background: '#00FF41', boxShadow: '0 0 14px rgba(0,255,65,0.5)' }}
          >
            {isThisPlaying ? (
              <svg className="w-5 h-5" fill="#131313" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="#131313" viewBox="0 0 24 24">
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
                  background: isThisPlaying ? '#00FF41' : 'rgba(255,255,255,0.15)',
                  boxShadow: isThisPlaying ? '0 0 4px rgba(0,255,65,0.8)' : undefined,
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
            style={{ background: '#00FF41', boxShadow: '0 0 6px rgba(0,255,65,0.9)' }}
          />
        )}
      </div>

      {/* Metadata — flex-1 only when not featured (featured lets image expand instead) */}
      <div className={`flex flex-col gap-1.5 ${featured ? 'p-4 flex-shrink-0' : 'p-3 flex-1'}`}>
        {/* Category + date row */}
        <div className="flex items-center justify-between gap-2">
          {episode.category ? (
            <span
              className="text-xs px-1.5 py-0.5 tracking-wider uppercase flex-shrink-0"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: 'rgba(0,255,65,0.08)',
                borderLeft: '1px solid rgba(0,255,65,0.4)',
                color: '#00FF41',
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
            style={{ color: 'rgba(185,204,178,0.5)', fontSize: '9px' }}
          >
            {formatDate(episode.addedAt)}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`font-semibold leading-snug line-clamp-2 ${featured ? 'text-base' : 'text-sm'}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {episode.title}
        </h3>

        {/* Show name */}
        <p
          className="text-xs uppercase tracking-wider truncate"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(0,255,65,0.7)' }}
        >
          {episode.showName}
        </p>

        {/* Description */}
        {episode.description && (
          <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'rgba(185,204,178,0.4)' }}>
            {episode.description}
          </p>
        )}
      </div>
    </div>
  )
}
