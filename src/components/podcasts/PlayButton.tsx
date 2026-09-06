'use client'

import { memo } from 'react'
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

function PlayButton({ episode, queue, size = 'md', className = '' }: PlayButtonProps) {
  const { currentEpisode, isPlaying, isLoading, play, pause } = usePlayer()

  // An episode with no source must not offer a control that silently does
  // nothing — development fixtures and half-entered records both hit this.
  const playable = episode.audioUrl.trim().length > 0
  const isCurrent = currentEpisode?.id === episode.id
  const playingThis = isCurrent && isPlaying
  const loadingThis = isCurrent && isLoading
  const { box, icon } = SIZES[size]

  const onClick = () => {
    if (playingThis) pause()
    else play(episode, queue)
  }

  // Nothing is rendered in the play slot: a full-weight badge where the primary
  // affordance goes reads as breakage. The absence is stated in the meta line
  // instead (see EpisodeCard / EpisodeIndex).
  if (!playable) return null

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
        color: 'var(--on-ember)',
        boxShadow: playingThis ? '0 0 0 4px rgba(255,106,43,0.2)' : undefined,
      }}
    >
      {loadingThis ? (
        <svg width={icon} height={icon} viewBox="0 0 24 24" className="spin" aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="14 42"
          />
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

export default memo(PlayButton)
