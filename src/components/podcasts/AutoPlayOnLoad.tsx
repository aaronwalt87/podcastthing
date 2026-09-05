'use client'

import { useEffect, useRef } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import type { Episode } from '@/types/episode'

interface AutoPlayOnLoadProps {
  episodes: Episode[]
  /** Episode id from `?play=` — set when arriving from the command palette. */
  playId?: string
}

/**
 * Starts the episode named in the URL, once. Renders nothing; it exists so the
 * palette can deep-link into playback without the page owning player state.
 */
export default function AutoPlayOnLoad({ episodes, playId }: AutoPlayOnLoadProps) {
  const { play } = usePlayer()
  const handled = useRef<string | null>(null)

  useEffect(() => {
    if (!playId || handled.current === playId) return

    const episode = episodes.find((e) => e.id === playId)
    if (!episode) return

    handled.current = playId
    play(episode, episodes)
  }, [episodes, play, playId])

  return null
}
