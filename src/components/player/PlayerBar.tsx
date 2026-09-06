'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePlayer, usePlayerClock, PLAYBACK_RATES } from '@/context/PlayerContext'
import EpisodeArtwork from '@/components/podcasts/EpisodeArtwork'
import TranscriptLink from '@/components/podcasts/TranscriptLink'
import { duration as formatDuration } from '@/lib/format'

function Icon({ path, size = 16 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  play: 'M8 5.14v13.72a1 1 0 0 0 1.54.84l10.1-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z',
  back15:
    'M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7Zm-2.1 5.6h.9v4.2h-.9v-3.3l-.9.3v-.75l.9-.45Zm3.4 0h2.3v.8h-1.5l-.1.9c.1-.05.25-.08.4-.08.85 0 1.4.55 1.4 1.32 0 .85-.63 1.4-1.55 1.4-.6 0-1.1-.22-1.4-.55l.45-.6c.25.24.55.37.9.37.42 0 .68-.24.68-.6 0-.35-.26-.58-.66-.58-.24 0-.45.08-.62.22l-.55-.28Z',
  fwd30:
    'M12 5V2l5 4-5 4V7a5 5 0 1 0 5 5h2a7 7 0 1 1-7-7Zm-2.2 5.5c.85 0 1.45.5 1.45 1.25 0 .45-.22.78-.55.95.4.17.65.53.65 1.02 0 .82-.65 1.35-1.6 1.35-.62 0-1.15-.22-1.48-.58l.45-.6c.26.27.6.42.98.42.44 0 .72-.22.72-.56 0-.35-.27-.55-.75-.55h-.4v-.72h.37c.42 0 .68-.2.68-.52 0-.3-.24-.5-.62-.5-.35 0-.65.14-.9.4l-.45-.58c.34-.35.83-.55 1.45-.55Zm4.05 0c.98 0 1.6.8 1.6 2.28 0 1.47-.62 2.28-1.6 2.28s-1.6-.8-1.6-2.28c0-1.48.62-2.28 1.6-2.28Zm0 .82c-.42 0-.68.5-.68 1.46 0 .95.26 1.45.68 1.45s.68-.5.68-1.45c0-.96-.26-1.46-.68-1.46Z',
  pause: 'M6 5h4v14H6zm8 0h4v14h-4z',
  next: 'M6 18l8.5-6L6 6v12zM16 6h2v12h-2z',
  prev: 'M18 6l-8.5 6L18 18V6zM8 6H6v12h2z',
  close: 'M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z',
  volume: 'M4 9v6h4l5 5V4L8 9H4zm11.5 3a4 4 0 0 0-2.5-3.7v7.4a4 4 0 0 0 2.5-3.7Z',
  muted: 'M4 9v6h4l5 5V4L8 9H4zm12.6 3 2.4-2.4-1.2-1.2L15.4 10.8 13 8.4l-1.2 1.2 2.4 2.4-2.4 2.4 1.2 1.2 2.4-2.4 2.4 2.4 1.2-1.2Z',
}

/** Scrubber. Isolated so the ticking clock re-renders only this subtree. */
function Scrubber() {
  const { seekTo } = usePlayer()
  const { currentTime, duration } = usePlayerClock()
  const [dragValue, setDragValue] = useState<number | null>(null)

  const value = dragValue ?? currentTime
  const max = duration || 0
  const percent = max > 0 ? (value / max) * 100 : 0

  return (
    <div className="flex flex-1 items-center gap-3">
      <span className="num w-11 shrink-0 text-right text-[11px] text-paper-2">
        {formatDuration(value)}
      </span>

      <input
        type="range"
        min={0}
        max={max || 1}
        step={1}
        value={value}
        disabled={max === 0}
        onChange={(e) => setDragValue(Number(e.target.value))}
        onPointerUp={() => {
          if (dragValue !== null) seekTo(dragValue)
          setDragValue(null)
        }}
        onKeyUp={() => {
          if (dragValue !== null) seekTo(dragValue)
          setDragValue(null)
        }}
        aria-label="Seek"
        aria-valuetext={`${formatDuration(value)} of ${formatDuration(max)}`}
        style={{ ['--range-progress' as string]: `${percent}%` }}
      />

      <span className="num w-11 shrink-0 text-[11px] text-paper-2">{formatDuration(max)}</span>
    </div>
  )
}

export default function PlayerBar() {
  const {
    currentEpisode,
    isPlaying,
    isLoading,
    error,
    rate,
    muted,
    queue,
    pause,
    resume,
    next,
    previous,
    skip,
    setRate,
    toggleMute,
    shortcutsEnabled,
    setShortcutsEnabled,
  } = usePlayer()

  const [optionsOpen, setOptionsOpen] = useState(false)
  const optionsRef = useRef<HTMLDivElement>(null)
  const optionsToggleRef = useRef<HTMLButtonElement>(null)

  // Escape and an outside click both close the disclosure — and hand focus
  // back to the toggle if it was inside, or hiding the panel would drop focus
  // to <body>. Same pattern as the mobile menu in SiteHeader.
  useEffect(() => {
    if (!optionsOpen) return

    const close = () => {
      const hadFocus = optionsRef.current?.contains(document.activeElement)
      setOptionsOpen(false)
      if (hadFocus) optionsToggleRef.current?.focus()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!optionsRef.current?.contains(e.target as Node)) close()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [optionsOpen])

  const cycleRate = useCallback(() => {
    const i = PLAYBACK_RATES.indexOf(rate as (typeof PLAYBACK_RATES)[number])
    setRate(PLAYBACK_RATES[(i + 1) % PLAYBACK_RATES.length])
  }, [rate, setRate])

  if (!currentEpisode) return null

  const hasQueue = queue.length > 1

  return (
    <>
      {/* Keeps the fixed bar from covering the end of the page. */}
      <div aria-hidden="true" style={{ height: 'var(--player-h)' }} />
    <div
      className="fixed inset-x-0 bottom-0 z-[110] border-t border-hair"
      style={{
        background: 'rgba(9,11,14,0.9)',
        backdropFilter: 'blur(18px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
      }}
      role="region"
      aria-label="Audio player"
    >
      {error && (
        <p
          role="alert"
          className="border-b px-4 py-2 text-center text-xs"
          style={{
            color: 'var(--neg-text)',
            background: 'var(--neg-ghost)',
            borderColor: 'var(--neg-edge)',
          }}
        >
          {error}
        </p>
      )}

      <div className="shell flex items-center gap-4 py-3">
        {/* Now playing */}
        <div className="flex min-w-0 items-center gap-3 sm:w-64 lg:w-72">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-ink-800">
            <EpisodeArtwork episode={currentEpisode} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-paper">{currentEpisode.title}</p>
            {/* The show name truncates, not the row: `truncate` on the parent
                would clip the transcript link out of view while leaving it in
                the tab order. */}
            <p className="flex items-baseline gap-1.5 text-[11px] text-paper-2">
              <span className="truncate">{currentEpisode.showName}</span>
              {currentEpisode.transcriptUrl && (
                <>
                  <span aria-hidden="true" className="shrink-0">
                    ·
                  </span>
                  <TranscriptLink episode={currentEpisode} className="shrink-0" />
                </>
              )}
            </p>
          </div>
        </div>

        {/* Transport */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-center gap-1">
            {hasQueue && (
              <button
                type="button"
                onClick={previous}
                className="btn btn-ghost btn-icon hidden sm:inline-flex"
                aria-label="Previous episode"
              >
                <Icon path={ICONS.prev} />
              </button>
            )}

            <button
              type="button"
              onClick={() => skip(-15)}
              className="btn btn-ghost btn-icon"
              aria-label="Back 15 seconds"
            >
              <Icon path={ICONS.back15} size={18} />
            </button>

            <button
              type="button"
              onClick={isPlaying ? pause : resume}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="mx-1 inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
              style={{ background: 'var(--paper)', color: 'var(--ink-950)' }}
            >
              {isLoading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" className="spin" aria-hidden="true">
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
              ) : (
                <Icon path={isPlaying ? ICONS.pause : ICONS.play} size={16} />
              )}
            </button>

            <button
              type="button"
              onClick={() => skip(30)}
              className="btn btn-ghost btn-icon"
              aria-label="Forward 30 seconds"
            >
              <Icon path={ICONS.fwd30} size={18} />
            </button>

            {hasQueue && (
              <button
                type="button"
                onClick={next}
                className="btn btn-ghost btn-icon hidden sm:inline-flex"
                aria-label="Next episode"
              >
                <Icon path={ICONS.next} />
              </button>
            )}


          </div>

          <div className="hidden sm:flex">
            <Scrubber />
          </div>
        </div>

        {/* Options. Mute stays inline; rate and the shortcut toggle sit behind a
            disclosure available at every width. Nothing is removed at a
            breakpoint, so the row still fits a 320px viewport (1.4.10). */}
        <div ref={optionsRef} className="relative flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleMute}
            className="btn btn-ghost btn-icon"
            aria-label={muted ? 'Unmute' : 'Mute'}
            aria-pressed={muted}
          >
            <Icon path={muted ? ICONS.muted : ICONS.volume} />
          </button>

          <button
            ref={optionsToggleRef}
            type="button"
            onClick={() => setOptionsOpen((o) => !o)}
            aria-expanded={optionsOpen}
            aria-controls="player-options"
            aria-label="Playback options"
            className="btn btn-ghost btn-icon"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </button>

          {/* `hidden` alone is not enough here: Tailwind's `flex` utility has the
              same specificity as the preflight's [hidden]{display:none} and comes
              later in the cascade, so the panel would stay visible. The display
              class is applied conditionally instead. */}
          <div
            id="player-options"
            hidden={!optionsOpen}
            className={`panel absolute bottom-[calc(100%+10px)] right-0 items-center gap-1 p-1.5 ${
              optionsOpen ? 'flex' : ''
            }`}
            style={{ boxShadow: 'var(--shadow-panel)' }}
          >
            <button
              type="button"
              onClick={cycleRate}
              className="btn btn-ghost btn-sm num"
              // Must contain the visible text so speech input can target it
              // (WCAG 2.5.3 Label in Name).
              aria-label={`Playback speed ${rate}\u00d7`}
            >
              {rate}&times;
            </button>

            {/* Single-key shortcuts collide with screen-reader quick-nav keys,
                so they are off until asked for (WCAG 2.1.4). */}
            <button
              type="button"
              onClick={() => setShortcutsEnabled(!shortcutsEnabled)}
              className="btn btn-ghost btn-sm num"
              aria-pressed={shortcutsEnabled}
              aria-label="K — single-key playback shortcuts"
              aria-describedby="shortcut-help"
            >
              {shortcutsEnabled ? 'K\u2713' : 'K'}
            </button>
            <span id="shortcut-help" className="sr-only">
              When on: space or K plays and pauses, J and the left arrow skip back fifteen
              seconds, L and the right arrow skip forward thirty, M mutes.
            </span>
          </div>
        </div>
      </div>

      {/* Compact scrubber below the controls on small screens */}
      <div className="shell pb-2 sm:hidden">
        <Scrubber />
      </div>
    </div>
    </>
  )
}
