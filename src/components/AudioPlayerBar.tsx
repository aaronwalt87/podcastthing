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
      className="fixed bottom-8 left-0 right-0 z-50"
      style={{
        background: 'rgba(14,14,14,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
      }}
    >
      {/* Scrub bar — tonal separation, no border */}
      <div className="relative h-1.5 cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${progress}%`,
            background: '#00FF41',
            boxShadow: '0 0 6px rgba(0,255,65,0.7)',
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

      {/* Controls */}
      <div className="flex items-center gap-4 px-4 py-3 max-w-screen-xl mx-auto">
        {/* Thumbnail */}
        {currentEpisode.thumbnailUrl ? (
          <img
            src={currentEpisode.thumbnailUrl}
            alt={currentEpisode.title}
            className="w-10 h-10 object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
            style={{ background: '#1c1b1b' }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="12" stroke="#353534" strokeWidth="1" fill="#131313"/>
              <rect x="5" y="11" width="14" height="5" stroke="#353534" strokeWidth="0.8" fill="#1c1b1b"/>
              <circle cx="8.5" cy="13.5" r="2.2" stroke="rgba(0,255,65,0.5)" strokeWidth="1" fill="#131313" strokeOpacity="0.5"/>
              <circle cx="8.5" cy="13.5" r="0.8" stroke="rgba(0,255,65,0.5)" strokeWidth="0.8" fill="#1c1b1b" strokeOpacity="0.5"/>
              <circle cx="15.5" cy="13.5" r="2.2" stroke="rgba(0,255,65,0.5)" strokeWidth="1" fill="#131313" strokeOpacity="0.5"/>
              <circle cx="15.5" cy="13.5" r="0.8" stroke="rgba(0,255,65,0.5)" strokeWidth="0.8" fill="#1c1b1b" strokeOpacity="0.5"/>
              <path d="M11 13.5 Q12 14.5 13 13.5" stroke="#FF3B3B" strokeWidth="1" fill="none"/>
            </svg>
          </div>
        )}

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {currentEpisode.title}
          </p>
          <p
            className="text-xs truncate tracking-widest uppercase"
            style={{ color: 'rgba(0,255,65,0.7)', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {currentEpisode.showName}
          </p>
        </div>

        {/* Time display */}
        <div
          className="text-xs tabular-nums hidden sm:block px-2 py-1"
          style={{
            color: 'rgba(0,255,65,0.7)',
            background: 'rgba(255,255,255,0.04)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Play/Pause — primary solid, phosphor glow */}
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-all"
          style={{
            background: '#00FF41',
            boxShadow: '0 0 12px rgba(0,255,65,0.3)',
            color: '#131313',
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
