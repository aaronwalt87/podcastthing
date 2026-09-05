'use client'

import { usePlayer, usePlayerClock } from '@/context/PlayerContext'
import Spotlight from '@/components/ui/Spotlight'
import PlayButton from './PlayButton'
import EpisodeArtwork from './EpisodeArtwork'
import { longDate } from '@/lib/format'
import type { Episode } from '@/types/episode'

interface EpisodeCardProps {
  episode: Episode
  queue?: Episode[]
  /** Wide, image-forward treatment used for the lead episode. */
  featured?: boolean
}

/** Thin bar showing how far into the episode the listener already is. */
function ResumeBar({ episode }: { episode: Episode }) {
  const { currentEpisode, progressFor } = usePlayer()
  const { currentTime, duration } = usePlayerClock()

  const isCurrent = currentEpisode?.id === episode.id
  const saved = progressFor(episode.id)

  // Only the playing episode has a known duration, so only it gets a live ratio.
  const ratio = isCurrent && duration > 0 ? currentTime / duration : 0
  if (ratio <= 0 && saved <= 0) return null

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-[3px] bg-ink-700"
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="h-full transition-[width] duration-300 ease-out"
        style={{
          width: ratio > 0 ? `${Math.min(ratio * 100, 100)}%` : '100%',
          background: ratio > 0 ? 'var(--ember)' : 'var(--ink-600)',
        }}
      />
    </div>
  )
}

export default function EpisodeCard({ episode, queue, featured = false }: EpisodeCardProps) {
  const { currentEpisode, isPlaying } = usePlayer()
  const isCurrent = currentEpisode?.id === episode.id

  return (
    <Spotlight className="h-full">
      <article
        className="panel group relative flex h-full flex-col overflow-hidden transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5"
        style={isCurrent ? { borderColor: 'rgba(255,106,43,0.4)' } : undefined}
        aria-current={isCurrent ? 'true' : undefined}
      >
        <div
          className={`relative overflow-hidden bg-ink-800 ${
            featured ? 'aspect-[16/9] md:aspect-[21/9]' : 'aspect-[16/10]'
          }`}
        >
          <EpisodeArtwork
            episode={episode}
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
              <span className="chip chip-accent">{isPlaying ? 'Playing' : 'Paused'}</span>
            )}
          </div>

          {episode.category && (
            <span className="chip absolute right-3 top-3 bg-ink-950/70 backdrop-blur">
              {episode.category}
            </span>
          )}

          <ResumeBar episode={episode} />
        </div>

        <div className={`flex flex-1 flex-col gap-2 ${featured ? 'p-6' : 'p-4'}`}>
          <div className="flex items-center gap-2.5">
            <span className="num text-[10px] uppercase tracking-wider text-ember">
              {episode.showName}
            </span>
            <span aria-hidden="true" className="h-2.5 w-px bg-hair-2" />
            <time
              className="num text-[10px] text-paper-3"
              dateTime={new Date(episode.addedAt).toISOString()}
            >
              {longDate(episode.addedAt)}
            </time>
          </div>

          <h3
            className={`clamp-2 font-medium leading-snug text-paper ${
              featured ? 'text-xl md:text-2xl' : 'text-[15px]'
            }`}
          >
            {episode.title}
          </h3>

          {episode.description && (
            <p
              className={`text-[13px] leading-relaxed text-paper-3 ${
                featured ? 'clamp-3' : 'clamp-2'
              }`}
            >
              {episode.description}
            </p>
          )}
        </div>
      </article>
    </Spotlight>
  )
}
