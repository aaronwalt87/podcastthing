'use client'

import { usePlayer } from '@/context/PlayerContext'
import type { Episode } from '@/types/episode'

interface PlayButtonProps {
  episode: Episode
  /** Episodes queued behind this one when playback starts. */
  queue?: Episode[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: { box: 32, icon: 12 },
  md: { box: 44, icon: 15 },
  lg: { box: 56, icon: 19 },
}

export default function PlayButton({ episode, queue, size = 'md', className = '' }: PlayButtonProps) {
  const { currentEpisode, isPlaying, isLoading, play, pause } = usePlayer()

  const isCurrent = currentEpisode?.id === episode.id
  const playingThis = isCurrent && isPlaying
  const loadingThis = isCurrent && isLoading
  const { box, icon } = SIZES[size]

  const onClick = () => {
    if (playingThis) pause()
    else play(episode, queue)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${playingThis ? 'Pause' : 'Play'} ${episode.title}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-spring hover:scale-105 active:scale-95 ${className}`}
      style={{
        width: box,
        height: box,
        background: 'var(--ember)',
        color: '#180a03',
        boxShadow: playingThis ? '0 0 0 4px rgba(255,106,43,0.2)' : undefined,
      }}
    >
      {loadingThis ? (
        <svg width={icon} height={icon} viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="14 42"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ) : playingThis ? (
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          style={{ marginLeft: 1 }}
        >
          <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.1-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
        </svg>
      )}
    </button>
  )
}
