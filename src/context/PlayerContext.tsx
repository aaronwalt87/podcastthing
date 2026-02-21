'use client'

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react'
import type { Episode } from '@/types/episode'

interface PlayerContextValue {
  currentEpisode: Episode | null
  isPlaying: boolean
  play: (episode: Episode) => void
  pause: () => void
  resume: () => void
  audioRef: React.RefObject<HTMLAudioElement>
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const play = useCallback((episode: Episode) => {
    setCurrentEpisode(episode)
    setIsPlaying(true)
    // AudioPlayerBar handles the actual audio.play() via useEffect on currentEpisode.id
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const resume = useCallback(() => {
    audioRef.current?.play()
    setIsPlaying(true)
  }, [])

  // Keep isPlaying in sync with native audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  return (
    <PlayerContext.Provider value={{ currentEpisode, isPlaying, play, pause, resume, audioRef }}>
      <audio ref={audioRef} preload="metadata" />
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
