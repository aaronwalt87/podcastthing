import type { Episode } from '@/types/episode'

/**
 * Hues come from a curated ramp rather than the full wheel — ember-adjacent
 * warms and the steel band that sits beside --cool. Seven entries so a
 * collision needs eight distinct shows.
 *
 * Both gradient stops use the SAME hue at different lightness. An earlier pass
 * offset the second stop by 42°, which turned hue 24 into 66 and hue 36 into 78
 * — the olive-green the system explicitly retired. Two stops of one hue is a
 * cover; two stops 42° apart is a colour accident.
 *
 * Lightness matters as much as hue: dropped too far, every cover reads as the
 * same near-black murk against --ink-800, which looks like a failed image.
 */
const RAMP = [12, 24, 36, 198, 210, 222, 240]

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

/**
 * Hairline texture, pitched to the well it sits in. A fixed 7px pitch put ~8
 * stripes across a 56px thumbnail (louder than the monogram) and ~88 across a
 * 615px well (invisible) — wrong at both ends. The angle is fixed so a column
 * of covers reads as one system rather than four rendering artifacts; hue alone
 * carries identity.
 */
const TEXTURE: Record<ArtworkSize, string> = {
  sm: '',
  md: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 14px),',
  lg: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 24px),',
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
          radial-gradient(120% 90% at 18% 0%, hsl(${hue} 42% 30% / 0.95), transparent 64%),
          radial-gradient(100% 85% at 92% 100%, hsl(${hue} 34% 13% / 0.92), transparent 66%),
          ${TEXTURE[size]}
          var(--ink-800)
        `,
      }}
      aria-hidden="true"
    >
      <span
        className={`num font-medium tracking-widest ${MARK_SIZE[size]}`}
        style={{ color: `hsl(${hue} 30% 82% / 0.62)` }}
      >
        {initials}
      </span>
    </div>
  )
}
