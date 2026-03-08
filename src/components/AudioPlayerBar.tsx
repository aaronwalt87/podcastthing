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
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(12, 8, 3, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(160,80,40,0.4)',
        boxShadow: '0 -2px 20px rgba(160,60,20,0.18), 0 -1px 0 rgba(120,50,20,0.2)',
      }}
    >
      {/* Top accent line */}
      <div className="h-px"
           style={{ background: 'linear-gradient(to right, transparent, rgba(200,70,30,0.5), rgba(180,110,50,0.3), transparent)' }} />

      {/* Scrub bar */}
      <div className="relative h-1.5 cursor-pointer" style={{ background: 'rgba(40,20,8,0.8)' }}>
        <div
          className="absolute left-0 top-0 h-full transition-all"
          style={{
            width: `${progress}%`,
            background: '#cc2810',
            boxShadow: '0 0 6px rgba(204,40,16,0.7)',
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
            style={{ border: '1px solid rgba(160,80,40,0.5)' }}
          />
        ) : (
          <div
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
            style={{ background: '#0e0803', border: '1px solid rgba(122,60,30,0.5)' }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="12" rx="1" stroke="#7a5030" strokeWidth="1" fill="#060401"/>
              <rect x="5" y="11" width="14" height="5" rx="0.5" stroke="#5a3820" strokeWidth="0.8" fill="#030200"/>
              <circle cx="8.5" cy="13.5" r="2.2" stroke="#a07040" strokeWidth="1" fill="#060401"/>
              <circle cx="8.5" cy="13.5" r="0.8" stroke="#c49060" strokeWidth="0.8" fill="#030200"/>
              <circle cx="15.5" cy="13.5" r="2.2" stroke="#a07040" strokeWidth="1" fill="#060401"/>
              <circle cx="15.5" cy="13.5" r="0.8" stroke="#c49060" strokeWidth="0.8" fill="#030200"/>
              <path d="M11 13.5 Q12 14.5 13 13.5" stroke="#cc3020" strokeWidth="1" fill="none"/>
            </svg>
          </div>
        )}

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono truncate tracking-wide" style={{ color: '#e8d8c0' }}>
            {currentEpisode.title}
          </p>
          <p className="text-xs truncate tracking-widest" style={{ color: '#a07850' }}>
            {currentEpisode.showName}
          </p>
        </div>

        {/* Time display */}
        <div
          className="text-xs tabular-nums hidden sm:block px-2 py-1 font-mono"
          style={{
            color: '#e83020',
            textShadow: '0 0 6px rgba(232,48,32,0.6)',
            background: '#080503',
            border: '1px solid rgba(120,40,20,0.5)',
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center transition-all"
          style={{
            background: '#cc2810',
            border: '1px solid rgba(220,80,40,0.7)',
            boxShadow: '0 0 12px rgba(204,40,16,0.5)',
            color: '#f5ead0',
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
