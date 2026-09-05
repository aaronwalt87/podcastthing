import type { Episode } from '@/types/episode'

/**
 * Hues are drawn from a curated ramp rather than the full wheel: two
 * ember-adjacent warms and three steel blues that sit beside --cool. A free
 * `hash % 360` produced olive, magenta and mid-green covers that were the
 * loudest colour on a page whose system allows exactly one accent.
 */
const RAMP = [14, 26, 202, 214, 236]

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
  const hue = RAMP[hashOf(seed) % RAMP.length]
  const initials = initialsOf(seed)

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{
        background: `
          radial-gradient(120% 90% at 20% 0%, hsl(${hue} 34% 24% / 0.92), transparent 62%),
          radial-gradient(100% 80% at 90% 100%, hsl(${(hue + 18) % 360} 40% 17% / 0.85), transparent 64%),
          var(--ink-800)
        `,
      }}
      aria-hidden="true"
    >
      <span
        className={`num font-medium tracking-widest ${MARK_SIZE[size]}`}
        style={{ color: `hsl(${hue} 26% 76% / 0.55)` }}
      >
        {initials}
      </span>
    </div>
  )
}
