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
    const onTimeUpdate = () => { if (!scrubRef.current) setCurrentTime(audio.currentTime) }
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
  const handleScrubStart = () => { scrubRef.current = true }
  const handleScrubEnd = () => {
    scrubRef.current = false
    if (audioRef.current) audioRef.current.currentTime = currentTime
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!currentEpisode) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: '#c4b488',
        borderTop: '3px solid #8a7840',
        boxShadow: '0 -4px 0 #a09060',
      }}
    >
      {/* Progress bar */}
      <div className="relative h-2" style={{ background: '#b0a070', cursor: 'pointer' }}>
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${progress}%`, background: '#cc2010' }}
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
          aria-label="Seek"
        />
      </div>

      {/* Main controls */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 max-w-screen-xl mx-auto">

        {/* Thumbnail */}
        <div
          className="flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 overflow-hidden"
          style={{ border: '2px solid #8a7040', boxShadow: '1px 1px 0 #6a5020' }}
        >
          {currentEpisode.thumbnailUrl ? (
            <img src={currentEpisode.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: '#2a1e10' }}>
              <svg viewBox="0 0 24 17" className="w-5" fill="none">
                <rect x="1" y="1" width="22" height="15" rx="2" fill="#c4b488" stroke="#8a7040" strokeWidth="1"/>
                <rect x="5" y="5" width="14" height="8" rx="1" fill="#1a1208" stroke="#6a5020" strokeWidth="0.8"/>
                <circle cx="9" cy="9" r="2.5" stroke="#c4b080" strokeWidth="0.8" fill="#0e0a05"/>
                <circle cx="15" cy="9" r="2.5" stroke="#c4b080" strokeWidth="0.8" fill="#0e0a05"/>
                <path d="M11 9 Q12 10.5 13 9" stroke="#cc2010" strokeWidth="1" fill="none"/>
              </svg>
            </div>
          )}
        </div>

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-mono font-bold truncate" style={{ color: '#2a1e10' }}>
            {currentEpisode.title}
          </p>
          <p className="text-xs font-mono truncate" style={{ color: '#6b5030' }}>
            {currentEpisode.showName}
          </p>
        </div>

        {/* Time — hidden on very small screens */}
        <div
          className="hidden xs:flex sm:flex items-center text-xs font-mono tabular-nums px-2 py-1 flex-shrink-0"
          style={{
            background: '#1a1208',
            color: '#d4c090',
            border: '2px solid #6a5020',
            borderBottom: '3px solid #4a3010',
            letterSpacing: '0.05em',
          }}
        >
          {formatTime(currentTime)}<span className="mx-0.5 opacity-50">/</span>{formatTime(duration)}
        </div>

        {/* Play / Pause */}
        <button
          onClick={isPlaying ? pause : resume}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 transition-opacity active:opacity-70"
          style={{
            background: '#cc2010',
            border: '2px solid #8b1508',
            borderBottom: '4px solid #6a1006',
            boxShadow: '1px 2px 0 #6a1006',
            color: '#f5ead8',
          }}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
