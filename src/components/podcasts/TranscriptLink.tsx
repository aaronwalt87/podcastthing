import type { Episode } from '@/types/episode'

/**
 * Text alternative for audio-only content (WCAG 1.2.1).
 *
 * These episodes are curated rather than produced here, so the alternative is
 * the publisher's own transcript. Where none exists the component says so
 * rather than staying silent — an undisclosed gap is worse than a disclosed
 * one, and a two-line description is not an equivalent alternative.
 */
export default function TranscriptLink({
  episode,
  className = '',
}: {
  episode: Episode
  className?: string
}) {
  if (episode.transcriptUrl) {
    return (
      <a
        href={episode.transcriptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`link-draw text-[13px] ${className}`}
      >
        Transcript <span aria-hidden="true">↗</span>
      </a>
    )
  }

  if (episode.sourceUrl) {
    return (
      <a
        href={episode.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-[13px] text-paper-2 underline decoration-hair-2 underline-offset-4 transition-colors hover:text-paper ${className}`}
      >
        Episode page <span aria-hidden="true">↗</span>
        <span className="sr-only"> — no transcript is available for this episode</span>
      </a>
    )
  }

  // Silence is the right default for an absent optional feature: a label on
  // every card would announce a missing capability to a reader who never
  // thought to want it — the same failure the "No audio" badge had.
  return null
}
