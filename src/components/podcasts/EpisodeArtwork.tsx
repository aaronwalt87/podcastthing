import type { Episode } from '@/types/episode'
import type { CSSProperties } from 'react'
import styles from './Podcast.module.css'

/** Token-derived paper sleeves keep each show recognizable across the site. */
const SLEEVES = ['var(--olive-light)', 'var(--ink-900)', 'var(--ember-ghost)']

/** Deterministic index from the show name, so a show keeps one identity. */
function hashOf(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** First letters of the first two *word* tokens — "Signals & Threads" is ST. */
function initialsOf(source: string): string {
  return source
    .split(/\s+/)
    .filter((word) => /^[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

type ArtworkSize = 'sm' | 'md' | 'lg'

const MARK_SIZE: Record<ArtworkSize, string> = {
  sm: 'text-[11px]',
  md: 'text-3xl',
  lg: 'text-6xl',
}

interface EpisodeArtworkProps {
  episode: Episode
  className?: string
  /** Scales the fallback monogram to the well it sits in. */
  size?: ArtworkSize
}

/**
 * Real artwork when the episode has it; otherwise a generated cover derived from
 * the show name — never a grey placeholder box.
 */
export default function EpisodeArtwork({
  episode,
  className = '',
  size = 'md',
}: EpisodeArtworkProps) {
  if (episode.thumbnailUrl) {
    return (
      // Sources are arbitrary remote hosts, so plain <img> avoids the optimiser.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={episode.thumbnailUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  const seed = episode.showName || episode.title
  const sleeve = SLEEVES[hashOf(seed) % SLEEVES.length]
  const initials = initialsOf(seed)

  return (
    <div
      className={`${styles.cover} flex h-full w-full items-center justify-center ${className}`}
      style={{ '--sleeve-color': sleeve } as CSSProperties}
      aria-hidden="true"
    >
      <span className={styles.disc} />
      {size !== 'sm' && <span className={styles.coverLabel}>{episode.showName}</span>}
      <span
        className={`${styles.monogram} ${MARK_SIZE[size]}`}
      >
        {initials}
      </span>
    </div>
  )
}
