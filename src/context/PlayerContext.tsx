'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Episode } from '@/types/episode'

const PROGRESS_KEY = 'signal:progress:v1'
const RATE_KEY = 'signal:rate:v1'
const VOLUME_KEY = 'signal:volume:v1'
const SHORTCUTS_KEY = 'signal:shortcuts:v1'
/** Don't restore a position within this many seconds of the end. */
const RESUME_TAIL_GUARD = 20
/** Don't bother restoring trivial progress. */
const RESUME_MIN = 15

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const

/* --------------------------------------------------------------- storage -- */

type ProgressMap = Record<string, number>

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode / quota — playback still works, it just won't resume */
  }
}

/* --------------------------------------------------------------- context -- */

interface TransportValue {
  currentEpisode: Episode | null
  /** Single-key shortcuts are opt-in (WCAG 2.1.4) and persist per browser. */
  shortcutsEnabled: boolean
  setShortcutsEnabled: (enabled: boolean) => void
  isPlaying: boolean
  /** True between selecting an episode and the first frame of audio. */
  isLoading: boolean
  error: string | null
  rate: number
  volume: number
  muted: boolean
  queue: Episode[]
  play: (episode: Episode, queue?: Episode[]) => void
  toggle: (episode?: Episode) => void
  pause: () => void
  resume: () => void
  next: () => void
  previous: () => void
  seekTo: (seconds: number) => void
  skip: (delta: number) => void
  setRate: (rate: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  /** Saved position for an episode, in seconds. 0 when unstarted. */
  progressFor: (episodeId: string) => number
  audioRef: React.RefObject<HTMLAudioElement>
}

interface ClockValue {
  currentTime: number
  duration: number
}

const TransportContext = createContext<TransportValue | null>(null)
/**
 * Time ticks ~4x/second. It lives in its own context so the whole page doesn't
 * re-render on every frame — only the scrubber subscribes to it.
 */
const ClockContext = createContext<ClockValue>({ currentTime: 0, duration: 0 })

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [queue, setQueue] = useState<Episode[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rate, setRateState] = useState(1)
  const [volume, setVolumeState] = useState(1)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [shortcutsEnabled, setShortcutsEnabledState] = useState(false)

  /**
   * Saved positions live in a ref, not state. They change every few seconds of
   * playback; holding them in state would invalidate `play`, `progressFor` and
   * everything memoised from them, re-rendering every consumer of the transport
   * context (and re-registering the MediaSession handlers) on that cadence.
   */
  const progressRef = useRef<ProgressMap>({})

  /** Position to seek to once metadata for the pending episode has loaded. */
  const pendingSeek = useRef<number | null>(null)
  /** Bumped to force a reload of the same source — used to retry after an error. */
  const [loadNonce, setLoadNonce] = useState(0)
  /** Identifies the current load; stale async callbacks compare against it. */
  const loadGeneration = useRef(0)

  /* ---------------------------------------------------- restore settings -- */
  useEffect(() => {
    progressRef.current = readJson<ProgressMap>(PROGRESS_KEY, {})
    setShortcutsEnabledState(readJson<boolean>(SHORTCUTS_KEY, false))
    const storedRate = readJson<number>(RATE_KEY, 1)
    const storedVolume = readJson<number>(VOLUME_KEY, 1)
    if (PLAYBACK_RATES.includes(storedRate as (typeof PLAYBACK_RATES)[number])) {
      setRateState(storedRate)
    }
    if (storedVolume >= 0 && storedVolume <= 1) setVolumeState(storedVolume)
  }, [])

  /* ------------------------------------------------------------ commands -- */

  const play = useCallback(
    (episode: Episode, nextQueue?: Episode[]) => {
      if (nextQueue) setQueue(nextQueue)

      const audio = audioRef.current
      const isSame = currentEpisode?.id === episode.id

      // Re-selecting a source that already failed must reload it. The element
      // latches its error, so calling play() again would reject silently and
      // leave the user with a cleared banner and no audio.
      if (isSame && !audio?.error) {
        setError(null)
        void audio?.play().catch(() => {})
        return
      }

      setError(null)
      const saved = progressRef.current[episode.id] ?? 0
      pendingSeek.current = saved > RESUME_MIN ? saved : null

      setCurrentEpisode(episode)
      setCurrentTime(saved > RESUME_MIN ? saved : 0)
      setDuration(0)
      setIsLoading(true)
      setIsPlaying(true)
      if (isSame) setLoadNonce((n) => n + 1)
    },
    [currentEpisode?.id]
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    setError(null)
    void audioRef.current?.play().catch(() => {})
  }, [])

  const toggle = useCallback(
    (episode?: Episode) => {
      if (episode && episode.id !== currentEpisode?.id) {
        play(episode)
        return
      }
      if (!currentEpisode) return
      if (isPlaying) pause()
      else resume()
    },
    [currentEpisode, isPlaying, pause, play, resume]
  )

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return
    const clamped = Math.min(Math.max(seconds, 0), audio.duration)
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  const skip = useCallback(
    (delta: number) => {
      const audio = audioRef.current
      if (!audio) return
      seekTo(audio.currentTime + delta)
    },
    [seekTo]
  )

  const indexInQueue = useMemo(
    () => (currentEpisode ? queue.findIndex((e) => e.id === currentEpisode.id) : -1),
    [currentEpisode, queue]
  )

  const next = useCallback(() => {
    if (indexInQueue < 0 || indexInQueue >= queue.length - 1) return
    play(queue[indexInQueue + 1])
  }, [indexInQueue, play, queue])

  const previous = useCallback(() => {
    const audio = audioRef.current
    // Mirror the usual transport convention: restart before stepping back.
    if (audio && audio.currentTime > 3) {
      seekTo(0)
      return
    }
    if (indexInQueue > 0) play(queue[indexInQueue - 1])
    else seekTo(0)
  }, [indexInQueue, play, queue, seekTo])

  const setRate = useCallback((value: number) => {
    setRateState(value)
    writeJson(RATE_KEY, value)
    if (audioRef.current) audioRef.current.playbackRate = value
  }, [])

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(Math.max(value, 0), 1)
    setVolumeState(clamped)
    writeJson(VOLUME_KEY, clamped)
    if (audioRef.current) {
      audioRef.current.volume = clamped
      if (clamped > 0) {
        audioRef.current.muted = false
        setMuted(false)
      }
    }
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const nextMuted = !m
      if (audioRef.current) audioRef.current.muted = nextMuted
      return nextMuted
    })
  }, [])

  const progressFor = useCallback((episodeId: string) => progressRef.current[episodeId] ?? 0, [])

  const setShortcutsEnabled = useCallback((enabled: boolean) => {
    setShortcutsEnabledState(enabled)
    writeJson(SHORTCUTS_KEY, enabled)
  }, [])

  /* ------------------------------------------------- audio element wiring -- */

  // Load a new source, then restore position and start playback.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentEpisode) return

    const generation = ++loadGeneration.current

    audio.src = currentEpisode.audioUrl
    audio.playbackRate = rate
    audio.volume = volume
    audio.muted = muted
    audio.load()

    void audio.play().catch((err: unknown) => {
      // Switching episodes aborts the previous load; that rejection belongs to
      // the old episode and must not overwrite the new one's state.
      if (generation !== loadGeneration.current) return
      if (err instanceof DOMException && err.name === 'AbortError') return
      // Autoplay policies can reject; surface it as "paused", not as an error.
      setIsPlaying(false)
      setIsLoading(false)
    })
    // `rate`/`volume`/`muted` are applied on load but must not re-trigger one.
    // `loadNonce` is the explicit retry signal for the same source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEpisode?.id, loadNonce])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
      if (pendingSeek.current !== null) {
        const target = pendingSeek.current
        pendingSeek.current = null
        if (Number.isFinite(audio.duration) && target < audio.duration - RESUME_TAIL_GUARD) {
          audio.currentTime = target
        }
      }
      setIsLoading(false)
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onPlay = () => {
      setIsPlaying(true)
      setError(null)
    }
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsLoading(true)
    const onPlaying = () => setIsLoading(false)
    const onError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      setError('This audio could not be loaded. The source may be offline or blocking playback.')
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('error', onError)
    }
  }, [])

  // Advance the queue when an episode finishes, and clear its saved position.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onEnded = () => {
      setIsPlaying(false)
      if (currentEpisode) {
        // A finished episode should start from the top next time.
        delete progressRef.current[currentEpisode.id]
        writeJson(PROGRESS_KEY, progressRef.current)
      }
      next()
    }

    audio.addEventListener('ended', onEnded)
    return () => audio.removeEventListener('ended', onEnded)
  }, [currentEpisode, next])

  // Persist position roughly every 5s of playback rather than on every tick.
  const lastPersisted = useRef(0)
  useEffect(() => {
    if (!currentEpisode || !isPlaying) return
    if (Math.abs(currentTime - lastPersisted.current) < 5) return
    lastPersisted.current = currentTime

    progressRef.current[currentEpisode.id] = currentTime
    writeJson(PROGRESS_KEY, progressRef.current)
  }, [currentEpisode, currentTime, isPlaying])

  /* --------------------------------------------------------- OS integration */

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    if (!currentEpisode) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentEpisode.title,
      artist: currentEpisode.showName,
      album: 'Aaron Walters — Signal',
      artwork: currentEpisode.thumbnailUrl
        ? [{ src: currentEpisode.thumbnailUrl, sizes: '512x512' }]
        : undefined,
    })

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => resume()],
      ['pause', () => pause()],
      ['seekbackward', () => skip(-15)],
      ['seekforward', () => skip(30)],
      ['previoustrack', () => previous()],
      ['nexttrack', () => next()],
    ]

    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        /* unsupported action on this browser */
      }
    }

    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch {
          /* no-op */
        }
      }
    }
  }, [currentEpisode, next, pause, previous, resume, skip])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  /* ---------------------------------------------------- keyboard shortcuts */

  useEffect(() => {
    // Bare single-character shortcuts collide with screen-reader quick-nav keys
    // (k, l, m are all browse-mode commands), so they are opt-in per WCAG 2.1.4.
    if (!shortcutsEnabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (!currentEpisode) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null

      if (
        target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      ) {
        return
      }

      // Space, Enter and the arrow keys belong to whatever control has focus.
      // Swallowing them here would break keyboard activation of every button
      // and link on the page.
      if (target?.closest('button, a, summary, [role="button"], [role="slider"], [tabindex]')) {
        return
      }

      switch (event.key) {
        case ' ':
        case 'k':
          event.preventDefault()
          toggle()
          break
        case 'ArrowLeft':
        case 'j':
          event.preventDefault()
          skip(-15)
          break
        case 'ArrowRight':
        case 'l':
          event.preventDefault()
          skip(30)
          break
        case 'm':
          event.preventDefault()
          toggleMute()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentEpisode, shortcutsEnabled, skip, toggle, toggleMute])

  /* ----------------------------------------------------------------- value */

  const transport = useMemo<TransportValue>(
    () => ({
      currentEpisode,
      shortcutsEnabled,
      setShortcutsEnabled,
      isPlaying,
      isLoading,
      error,
      rate,
      volume,
      muted,
      queue,
      play,
      toggle,
      pause,
      resume,
      next,
      previous,
      seekTo,
      skip,
      setRate,
      setVolume,
      toggleMute,
      progressFor,
      audioRef,
    }),
    [
      currentEpisode,
      shortcutsEnabled,
      setShortcutsEnabled,
      isPlaying,
      isLoading,
      error,
      rate,
      volume,
      muted,
      queue,
      play,
      toggle,
      pause,
      resume,
      next,
      previous,
      seekTo,
      skip,
      setRate,
      setVolume,
      toggleMute,
      progressFor,
    ]
  )

  const clock = useMemo<ClockValue>(() => ({ currentTime, duration }), [currentTime, duration])

  return (
    <TransportContext.Provider value={transport}>
      <ClockContext.Provider value={clock}>
        <audio ref={audioRef} preload="metadata" />
        {children}
      </ClockContext.Provider>
    </TransportContext.Provider>
  )
}

export function usePlayer(): TransportValue {
  const ctx = useContext(TransportContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}

/** Subscribe to playback position. Use only where the ticking value is shown. */
export function usePlayerClock(): ClockValue {
  return useContext(ClockContext)
}
