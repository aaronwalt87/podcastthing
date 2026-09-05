import type { Episode } from '@/types/episode'

/** Deterministic hue from the show name, so a show keeps one identity colour. */
function hueFor(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
}

interface EpisodeArtworkProps {
  episode: Episode
  className?: string
}

/**
 * Real artwork when the episode has it; otherwise a generated cover derived from
 * the show name — never a grey placeholder box.
 */
export default function EpisodeArtwork({ episode, className = '' }: EpisodeArtworkProps) {
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

  const hue = hueFor(episode.showName || episode.title)
  const initials = (episode.showName || episode.title)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={`flex h-full w-full items-center justify-center ${className}`}
      style={{
        background: `
          radial-gradient(120% 90% at 20% 0%, hsl(${hue} 62% 26% / 0.9), transparent 60%),
          radial-gradient(100% 80% at 90% 100%, hsl(${(hue + 40) % 360} 70% 20% / 0.85), transparent 62%),
          var(--ink-800)
        `,
      }}
      aria-hidden="true"
    >
      <span
        className="num text-2xl font-medium tracking-widest"
        style={{ color: `hsl(${hue} 40% 78% / 0.6)` }}
      >
        {initials}
      </span>
    </div>
  )
}
