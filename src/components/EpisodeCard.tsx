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
      // Toggle play/pause for current episode
      if (isPlaying) {
        pause()
      } else {
        resume()
      }
    } else {
      // Switch to new episode
      play(episode)
    }
  }

  return (
    <div
      className={`
        group relative flex flex-col rounded-xl overflow-hidden cursor-pointer
        border transition-all duration-300
        ${isCurrentEpisode
          ? 'border-violet-500/70 shadow-lg shadow-violet-500/20 bg-white/[0.07]'
          : 'border-white/10 hover:border-violet-500/40 hover:shadow-md hover:shadow-violet-500/10 bg-white/[0.04] hover:bg-white/[0.07]'
        }
      `}
      style={{ backdropFilter: 'blur(12px)' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${isThisPlaying ? 'Pause' : 'Play'} ${episode.title}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-neutral-800/60">
        {episode.thumbnailUrl ? (
          <img
            src={episode.thumbnailUrl}
            alt={episode.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-indigo-900/40">
            <svg className="w-12 h-12 text-violet-400/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        {/* Play/pause overlay */}
        <div className={`
          absolute inset-0 flex items-center justify-center
          bg-black/50 transition-opacity duration-200
          ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/40">
            {isThisPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* Now playing indicator */}
        {isCurrentEpisode && (
          <div className="absolute top-2 right-2 flex gap-0.5 items-end h-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full ${isThisPlaying ? 'animate-bounce bg-violet-400' : 'bg-violet-500/60'}`}
                style={{
                  height: `${[60, 100, 70][i - 1]}%`,
                  animationDelay: `${(i - 1) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-violet-400/80 text-xs uppercase tracking-wider truncate font-medium">
          {episode.showName}
        </p>
        <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug">
          {episode.title}
        </h3>
        {episode.description && (
          <p className="text-neutral-500 text-xs line-clamp-2 mt-1">
            {episode.description}
          </p>
        )}
        {episode.category && (
          <span className="self-start mt-1 text-xs px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20">
            {episode.category}
          </span>
        )}
      </div>
    </div>
  )
}
