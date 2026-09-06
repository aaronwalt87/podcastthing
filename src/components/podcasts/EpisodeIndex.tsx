'use client'

import { memo } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import EpisodeArtwork from './EpisodeArtwork'
import PlayButton from './PlayButton'
import TranscriptLink from './TranscriptLink'
import { longDate } from '@/lib/format'
import type { Episode } from '@/types/episode'

interface EpisodeIndexProps {
  episodes: Episode[]
  queue?: Episode[]
  /** Index of the first row, so a lead card above can own 01. */
  startAt?: number
}

function Row({
  episode,
  index,
  queue,
}: {
  episode: Episode
  index: number
  queue?: Episode[]
}) {
  const { currentEpisode, isPlaying } = usePlayer()
  const isCurrent = currentEpisode?.id === episode.id

  return (
    <li
      className="group grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4 border-t border-hair py-3 transition-colors hover:bg-white/[0.02] sm:gap-5 md:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto]"
      aria-current={isCurrent ? 'true' : undefined}
    >
      <span
        className="num w-6 text-xs"
        style={{ color: isCurrent ? 'var(--ember)' : 'var(--paper-3)' }}
      >
        {String(index).padStart(2, '0')}
      </span>

      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-ink-800">
        <EpisodeArtwork episode={episode} size="sm" />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium text-paper">{episode.title}</span>
        {/* The description fills what was a wide empty middle, and stops the
            index conveying less per item than the cards it replaced. */}
        {episode.description && (
          <span className="clamp-1 mt-0.5 hidden text-[13px] text-paper-3 md:block">
            {episode.description}
          </span>
        )}
        <span className="mt-0.5 flex items-center gap-2.5 md:hidden">
          {isCurrent && (
            <span className="chip chip-accent shrink-0">{isPlaying ? 'Playing' : 'Paused'}</span>
          )}
          <span className="num truncate text-[11px] uppercase tracking-wider text-paper-2">
            {episode.showName}
          </span>
          {episode.audioUrl.trim().length === 0 && (
            <>
              <span aria-hidden="true" className="text-paper-3">·</span>
              <span className="num shrink-0 text-[11px] text-paper-3">No audio</span>
            </>
          )}
        </span>
      </span>

      {/* Right-aligned meta gives the row a second edge to land on, instead of
          a wide empty middle between the title and the control. */}
      <span className="hidden items-center gap-2.5 md:flex">
        {/* Colour alone must not carry "this is the one playing". */}
        {isCurrent && (
          <span className="chip chip-accent shrink-0">{isPlaying ? 'Playing' : 'Paused'}</span>
        )}
        <span className="num truncate text-[11px] uppercase tracking-wider text-paper-2">
          {episode.showName}
        </span>
        <span aria-hidden="true" className="h-2.5 w-px shrink-0 bg-hair-2" />
        <time
          className="num shrink-0 text-[11px] text-paper-3"
          dateTime={new Date(episode.addedAt).toISOString()}
        >
          {longDate(episode.addedAt)}
        </time>
        {episode.audioUrl.trim().length === 0 && (
          <>
            <span aria-hidden="true" className="h-2.5 w-px shrink-0 bg-hair-2" />
            <span className="num shrink-0 text-[11px] text-paper-3">No audio</span>
          </>
        )}
        {episode.transcriptUrl && <TranscriptLink episode={episode} className="shrink-0" />}
      </span>

      <PlayButton episode={episode} queue={queue} size="sm" />
    </li>
  )
}

/**
 * Hairline-ruled editorial index. Used where a grid of identical cards would
 * just repeat the section above it — denser, and it scans in one column.
 */
function EpisodeIndex({ episodes, queue, startAt = 1 }: EpisodeIndexProps) {
  if (episodes.length === 0) return null

  return (
    // Tailwind's preflight removes list-style, which drops the list role in
    // Safari/VoiceOver — the numbering is the point, so restore it explicitly.
    <ol role="list" className="flex flex-col">
      {episodes.map((episode, i) => (
        <Row key={episode.id} episode={episode} index={startAt + i} queue={queue} />
      ))}
    </ol>
  )
}

export default memo(EpisodeIndex)
