'use client'

import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '@/context/PlayerContext'

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioPlayerBar() {
  const { currentEpisode, isPlaying, pause, resume, audioRef } = usePlayer()
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const scrubRef = useRef(false)
  const prevEpisodeId = useRef<string | null>(null)

  // Auto-play when episode changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentEpisode) return

    if (currentEpisode.id !== prevEpisodeId.current) {
      prevEpisodeId.current = currentEpisode.id
      audio.src = currentEpisode.audioUrl
      audio.load()
      audio.play().catch((err) => console.warn('Audio play error:', err))
    }
  }, [currentEpisode, audioRef])

  // Time/duration listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      if (!scrubRef.current) setCurrentTime(audio.currentTime)
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onDurationChange = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('durationchange', onDurationChange)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('durationchange', onDurationChange)
    }
  }, [audioRef])

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setCurrentTime(value)
  }

  const handleScrubStart = () => {
    scrubRef.current = true
    setIsScrubbing(true)
  }

  const handleScrubEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    scrubRef.current = false
    setIsScrubbing(false)
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = currentTime
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      resume()
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!currentEpisode) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800">
      {/* Scrub bar */}
      <div className="relative h-1 bg-neutral-700 group">
        <div
          className="absolute left-0 top-0 h-full bg-white transition-all"
          style={{ width: `${progress}%` }}
        />
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleScrubChange}
          onMouseDown={handleScrubStart}
          onMouseUp={handleScrubEnd}
          onTouchStart={handleScrubStart}
          onTouchEnd={handleScrubEnd}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Audio progress"
        />
      </div>

      {/* Player controls */}
      <div className="flex items-center gap-4 px-4 py-3 max-w-screen-xl mx-auto">
        {/* Thumbnail */}
        {currentEpisode.thumbnailUrl ? (
          <img
            src={currentEpisode.thumbnailUrl}
            alt={currentEpisode.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-neutral-700 flex-shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{currentEpisode.title}</p>
          <p className="text-neutral-400 text-xs truncate">{currentEpisode.showName}</p>
        </div>

        {/* Time */}
        <div className="text-neutral-400 text-xs tabular-nums hidden sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
