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
    setCurrentTime(Number(e.target.value))
  }

  const handleScrubStart = () => {
    scrubRef.current = true
    setIsScrubbing(true)
  }

  const handleScrubEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    scrubRef.current = false
    setIsScrubbing(false)
    const audio = audioRef.current
    if (audio) audio.currentTime = currentTime
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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-800/60"
      style={{
        background: 'rgba(4, 8, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -2px 20px rgba(29, 78, 216, 0.2), 0 -1px 0 rgba(59, 130, 246, 0.15)',
      }}
    >
      {/* Top neon accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      {/* Scrub bar */}
      <div className="relative h-1.5 bg-blue-950/80 group cursor-pointer">
        <div
          className="absolute left-0 top-0 h-full bg-amber-400 transition-all"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 6px rgba(251,191,36,0.7)',
          }}
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
        {/* Thumbnail / cassette icon */}
        {currentEpisode.thumbnailUrl ? (
          <img
            src={currentEpisode.thumbnailUrl}
            alt={currentEpisode.title}
            className="w-10 h-10 object-cover flex-shrink-0 border border-blue-700/50"
          />
        ) : (
          <div
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-blue-700/50"
            style={{ background: '#060d1a' }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="12" rx="1" stroke="#2563eb" strokeWidth="1" fill="#040810"/>
              <rect x="5" y="11" width="14" height="5" rx="0.5" stroke="#1d4ed8" strokeWidth="0.8" fill="#020408"/>
              <circle cx="8.5" cy="13.5" r="2.2" stroke="#3b82f6" strokeWidth="1" fill="#040810"/>
              <circle cx="8.5" cy="13.5" r="0.8" stroke="#60a5fa" strokeWidth="0.8" fill="#020408"/>
              <circle cx="15.5" cy="13.5" r="2.2" stroke="#3b82f6" strokeWidth="1" fill="#040810"/>
              <circle cx="15.5" cy="13.5" r="0.8" stroke="#60a5fa" strokeWidth="0.8" fill="#020408"/>
              <path d="M11 13.5 Q12 14.5 13 13.5" stroke="#f59e0b" strokeWidth="1" fill="none"/>
            </svg>
          </div>
        )}

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <p className="text-blue-100 text-xs font-mono truncate tracking-wide">{currentEpisode.title}</p>
          <p className="text-blue-500 text-xs truncate tracking-widest">{currentEpisode.showName}</p>
        </div>

        {/* Time display — retro terminal style */}
        <div
          className="text-amber-400 text-xs tabular-nums hidden sm:block px-2 py-1 border border-blue-900/50 font-mono"
          style={{ textShadow: '0 0 6px rgba(251,191,36,0.6)', background: '#060d1a' }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 text-black flex items-center justify-center transition-all border border-amber-300/80"
          style={{
            background: '#fbbf24',
            boxShadow: '0 0 12px rgba(251,191,36,0.6)',
          }}
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
