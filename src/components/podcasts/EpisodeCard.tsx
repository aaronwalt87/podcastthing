'use client'

import { memo } from 'react'
import { usePlayer, usePlayerClock } from '@/context/PlayerContext'
import Spotlight from '@/components/ui/Spotlight'
import PlayButton from './PlayButton'
import EpisodeArtwork from './EpisodeArtwork'
import TranscriptLink from './TranscriptLink'
import { longDate } from '@/lib/format'
import type { Episode } from '@/types/episode'

interface EpisodeCardProps {
  episode: Episode
  queue?: Episode[]
  /** Wide, image-forward treatment used for the lead episode. */
  featured?: boolean
  /** Running order, so a lead card followed by an index starting at 02 reads. */
  indexLabel?: number
}

function Bar({ ratio, live }: { ratio: number; live: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-ink-700" aria-hidden="true">
      <div
        className="h-full transition-[width] duration-300 ease-out"
        style={{
          width: `${Math.min(Math.max(ratio, 0) * 100, 100)}%`,
          background: live ? 'var(--ember)' : 'var(--ink-600)',
        }}
      />
    </div>
  )
}

/**
 * Live position for the episode currently playing. Split into its own component
 * so the ~4Hz clock subscription exists on exactly one card, not on all of them.
 */
function LiveResumeBar() {
  const { currentTime, duration } = usePlayerClock()
  if (duration <= 0) return null
  return <Bar ratio={currentTime / duration} live />
}

/** Thin bar showing how far into the episode the listener already is. */
function ResumeBar({ episode, isCurrent }: { episode: Episode; isCurrent: boolean }) {
  const { progressFor } = usePlayer()

  if (isCurrent) return <LiveResumeBar />
  // Duration is unknown for anything not loaded, so a started episode gets a
  // full marker rather than a misleading ratio.
  return progressFor(episode.id) > 0 ? <Bar ratio={1} live={false} /> : null
}

function EpisodeCard({ episode, queue, featured = false, indexLabel }: EpisodeCardProps) {
  const { currentEpisode, isPlaying } = usePlayer()
  const isCurrent = currentEpisode?.id === episode.id

  return (
    <Spotlight className="h-full">
      <article
        className={`panel group relative flex h-full overflow-hidden transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5 ${
          featured ? 'flex-col md:grid md:grid-cols-2 md:items-stretch' : 'flex-col'
        }`}
        style={isCurrent ? { borderColor: 'rgba(255,106,43,0.4)' } : undefined}
        aria-current={isCurrent ? 'true' : undefined}
      >
        <div
          className={`relative overflow-hidden bg-ink-800 ${
            featured ? 'aspect-[16/9] md:aspect-auto md:h-full md:min-h-[300px]' : 'aspect-[16/10]'
          }`}
        >
          <EpisodeArtwork
            episode={episode}
            size={featured ? 'lg' : 'md'}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(7,8,10,0) 40%, rgba(7,8,10,0.72) 100%)',
            }}
          />

          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <PlayButton
              episode={episode}
              queue={queue}
              size={featured ? 'lg' : 'md'}
            />
            {isCurrent && (
              // Opaque backdrop: chips sit over arbitrary remote artwork, where
              // a translucent fill can land at 3.3:1.
              <span className="chip chip-accent bg-ink-950/80 backdrop-blur">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            )}
          </div>

          {/* Featured cards carry the category in their meta row instead. */}
          {episode.category && !featured && (
            <span className="chip absolute right-3 top-3 bg-ink-950/70 backdrop-blur">
              {episode.category}
            </span>
          )}

          <ResumeBar episode={episode} isCurrent={isCurrent} />
        </div>

        <div
          className={`flex flex-col gap-2 ${
            featured ? 'p-6 md:justify-center md:p-8' : 'flex-1 p-4'
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {featured && indexLabel !== undefined && (
              <span className="num text-[11px] text-paper-3">
                {String(indexLabel).padStart(2, '0')}
                <span aria-hidden="true" className="ml-2.5 text-paper-3">·</span>
              </span>
            )}
            <span className="num text-[11px] uppercase tracking-wider text-paper-2">
              {episode.showName}
            </span>
            <span aria-hidden="true" className="hidden h-2.5 w-px bg-hair-2 sm:block" />
            <time
              className="num text-[11px] text-paper-3"
              dateTime={new Date(episode.addedAt).toISOString()}
            >
              {longDate(episode.addedAt)}
            </time>
            {episode.audioUrl.trim().length === 0 && (
              <>
                <span aria-hidden="true" className="text-paper-3">·</span>
                <span className="num text-[11px] text-paper-3">No audio</span>
              </>
            )}
          </div>

          <h3
            className={`clamp-3 font-medium leading-snug text-paper ${
              featured ? 'text-xl md:text-[28px] md:leading-[1.15]' : 'clamp-2 text-[15px]'
            }`}
          >
            {episode.title}
          </h3>

          {episode.description && (
            <p
              className={`leading-relaxed text-paper-2 ${
                featured ? 'clamp-3 max-w-[46ch] text-[14px]' : 'clamp-2 text-[13px]'
              }`}
            >
              {episode.description}
            </p>
          )}

          {/* 1.2.1 is a per-item criterion: one disclosed episode does not
              carry the rest. Rendered on every card, featured or not — and the
              row collapses entirely when there is nothing to put in it. */}
          {(episode.transcriptUrl || episode.sourceUrl || (featured && episode.category)) && (
            <div
              className={`flex flex-wrap items-center gap-3 ${
                featured ? 'mt-auto max-w-[46ch] justify-between pt-5' : 'pt-1'
              }`}
            >
              <TranscriptLink episode={episode} />
              {featured && episode.category && <span className="chip">{episode.category}</span>}
            </div>
          )}
        </div>
      </article>
    </Spotlight>
  )
}

export default memo(EpisodeCard)
