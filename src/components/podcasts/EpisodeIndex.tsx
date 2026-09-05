'use client'

import { memo } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import EpisodeArtwork from './EpisodeArtwork'
import PlayButton from './PlayButton'
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
  const { currentEpisode } = usePlayer()
  const isCurrent = currentEpisode?.id === episode.id

  return (
    <li
      className="group grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-4 border-t border-hair py-4 transition-colors hover:bg-white/[0.02] sm:gap-5"
      aria-current={isCurrent ? 'true' : undefined}
    >
      <span
        className="num w-6 text-xs"
        style={{ color: isCurrent ? 'var(--ember)' : 'var(--paper-3)' }}
      >
        {String(index).padStart(2, '0')}
      </span>

      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-ink-800 sm:h-14 sm:w-14">
        <EpisodeArtwork episode={episode} size="sm" />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[15px] font-medium text-paper">{episode.title}</span>
        <span className="mt-0.5 flex items-center gap-2.5">
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
        </span>
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
    <ol className="flex flex-col">
      {episodes.map((episode, i) => (
        <Row key={episode.id} episode={episode} index={startAt + i} queue={queue} />
      ))}
    </ol>
  )
}

export default memo(EpisodeIndex)
