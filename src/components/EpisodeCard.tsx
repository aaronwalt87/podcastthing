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
      className="group relative flex flex-col overflow-hidden cursor-pointer transition-all duration-200 rounded-sm"
      style={{
        border: isCurrentEpisode ? '1px solid rgba(232,48,32,0.8)' : '1px solid rgba(122,80,40,0.35)',
        background: isCurrentEpisode ? 'rgba(80,20,10,0.35)' : 'rgba(30,18,8,0.5)',
        boxShadow: isCurrentEpisode ? '0 0 16px rgba(232,48,32,0.22), inset 0 0 20px rgba(200,40,20,0.04)' : undefined,
      }}
      onMouseEnter={(e) => {
        if (!isCurrentEpisode) {
          (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(160,80,40,0.6)'
          ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(40,22,10,0.6)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isCurrentEpisode) {
          (e.currentTarget as HTMLDivElement).style.border = '1px solid rgba(122,80,40,0.35)'
          ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(30,18,8,0.5)'
        }
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${episode.title}`}
    >
      {/* Corner brackets */}
      <span className="absolute top-0 left-0 w-2 h-2 z-10"
            style={{ borderTop: '1px solid rgba(196,130,80,0.5)', borderLeft: '1px solid rgba(196,130,80,0.5)' }} />
      <span className="absolute top-0 right-0 w-2 h-2 z-10"
            style={{ borderTop: '1px solid rgba(196,130,80,0.5)', borderRight: '1px solid rgba(196,130,80,0.5)' }} />

      {/* Thumbnail */}
      <div className="relative aspect-square" style={{ background: '#140e06' }}>
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #1a1008 0%, #2d1e10 100%)' }}>
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="14" width="40" height="24" rx="2" stroke="#7a5030" strokeWidth="1.5" fill="#0e0803"/>
              <rect x="10" y="22" width="28" height="10" rx="1" stroke="#5a3820" strokeWidth="1" fill="#060401"/>
              <circle cx="17" cy="27" r="5" stroke="#a07040" strokeWidth="1.5" fill="#0e0803"/>
              <circle cx="17" cy="27" r="2" stroke="#c49060" strokeWidth="1" fill="#060401"/>
              <circle cx="31" cy="27" r="5" stroke="#a07040" strokeWidth="1.5" fill="#0e0803"/>
              <circle cx="31" cy="27" r="2" stroke="#c49060" strokeWidth="1" fill="#060401"/>
              <path d="M22 27 Q24 29 26 27" stroke="#cc3020" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
        )}

        {/* Play/pause overlay */}
        <div className={`
          absolute inset-0 flex items-center justify-center
          transition-opacity duration-200
          ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{
              background: 'rgba(10,6,2,0.75)',
              border: '1px solid rgba(220,60,30,0.8)',
              boxShadow: '0 0 14px rgba(220,60,30,0.5)',
            }}
          >
            {isThisPlaying ? (
              <svg className="w-5 h-5" fill="#e83020" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="#e83020" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* VU bars — now playing indicator */}
        {isCurrentEpisode && (
          <div className="absolute top-2 right-2 flex gap-0.5 items-end h-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={isThisPlaying ? 'animate-bounce' : ''}
                style={{
                  width: 4,
                  height: `${[55, 100, 70, 85][i - 1]}%`,
                  background: isThisPlaying ? '#e83020' : '#7a3020',
                  boxShadow: isThisPlaying ? '0 0 4px rgba(232,48,32,0.8)' : undefined,
                  animationDelay: `${(i - 1) * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Active bottom line */}
        {isCurrentEpisode && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5"
               style={{ background: '#e83020', boxShadow: '0 0 6px rgba(232,48,32,0.9)' }} />
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1 flex-1"
           style={{ borderTop: '1px solid rgba(90,50,20,0.35)' }}>
        <p className="text-xs uppercase tracking-widest truncate" style={{ color: '#a07850' }}>
          {episode.showName}
        </p>
        <h3 className="text-xs font-medium line-clamp-2 leading-snug" style={{ color: '#e8d8c0' }}>
          {episode.title}
        </h3>
        {episode.description && (
          <p className="text-xs line-clamp-2 mt-0.5" style={{ color: '#6b4a28' }}>
            {episode.description}
          </p>
        )}
        {episode.category && (
          <span className="self-start mt-1 text-xs px-1.5 py-0 tracking-wider"
                style={{ border: '1px solid rgba(160,80,40,0.45)', color: '#c49070' }}>
            {episode.category}
          </span>
        )}
      </div>

      {/* Bottom corner brackets */}
      <span className="absolute bottom-0 left-0 w-2 h-2"
            style={{ borderBottom: '1px solid rgba(160,100,50,0.3)', borderLeft: '1px solid rgba(160,100,50,0.3)' }} />
      <span className="absolute bottom-0 right-0 w-2 h-2"
            style={{ borderBottom: '1px solid rgba(160,100,50,0.3)', borderRight: '1px solid rgba(160,100,50,0.3)' }} />
    </div>
  )
}
