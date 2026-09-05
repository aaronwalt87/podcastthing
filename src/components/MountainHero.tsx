'use client'

import { useEffect, useRef } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import type { Episode } from '@/types/episode'

interface MountainHeroProps {
  latestEpisode: Episode | null
}

export default function MountainHero({ latestEpisode }: MountainHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const { play } = usePlayer()

  useEffect(() => {
    const update = () => {
      const hero = heroRef.current
      if (!hero) return
      const rect = hero.getBoundingClientRect()
      const travel = Math.max(hero.offsetHeight - window.innerHeight, 1)
      const progress = Math.min(1, Math.max(0, -rect.top / travel))
      hero.style.setProperty('--hero-progress', progress.toFixed(4))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <section ref={heroRef} className="mountain-hero" aria-label="Colorado technology dashboard">
      <div className="mountain-stage">
        <div className="mountain-photo mountain-photo--sunset" aria-hidden="true" />
        <div className="mountain-photo mountain-photo--ridge" aria-hidden="true" />
        <div className="mountain-photo mountain-photo--day" aria-hidden="true" />
        <div className="mountain-cloud mountain-cloud--one" aria-hidden="true" />
        <div className="mountain-cloud mountain-cloud--two" aria-hidden="true" />
        <div className="mountain-vignette" aria-hidden="true" />

        <div className="mountain-copy">
          <p className="mountain-kicker">
            <span className="mountain-dot" />
            Technology · systems · signal
          </p>
          <h1>
            Technology,
            <span> from a higher elevation.</span>
          </h1>
          <p className="mountain-deck">
            A live dashboard for the things I&apos;m tracking, building, listening to, and learning.
            Scroll through the landscape to enter the signal.
          </p>
          <div className="mountain-actions">
            <a href="#news" className="mountain-button mountain-button--primary">Open live dashboard</a>
            {latestEpisode && (
              <button
                type="button"
                onClick={() => play(latestEpisode)}
                className="mountain-button mountain-button--ghost"
              >
                Play latest podcast
              </button>
            )}
          </div>
        </div>

        <div className="mountain-scroll-cue" aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  )
}
