'use client'

import { usePlayer } from '@/context/PlayerContext'
import type { Episode } from '@/types/episode'

interface TerminalHeroProps {
  latestEpisode: Episode | null
}

export default function TerminalHero({ latestEpisode }: TerminalHeroProps) {
  const { play } = usePlayer()

  return (
    <div className="glass rounded-lg mb-6 overflow-hidden">
      {/* Title bar — macOS window chrome */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#fdbb2c' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <span className="font-mono text-xs ml-2" style={{ color: '#b9ccb2', fontSize: '11px' }}>
          KERNEL_GLASS {'// ROOT@PODCAST_TERM'}
        </span>
      </div>

      {/* Hero content */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 p-6 lg:p-8 items-center">
        <div>
          {/* Status chip */}
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 mb-5 rounded font-mono text-xs uppercase"
            style={{
              border: '1px solid rgba(0,255,65,0.35)',
              color: '#00FF41',
              background: 'rgba(0,255,65,0.07)',
              fontSize: '10px',
            }}
          >
            {'{ SYSTEM_STATUS: ACTIVE }'}
          </div>

          {/* Headline */}
          <h1
            className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-white mb-3 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            PODCAST
            <span style={{ color: '#00FF41', textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>
              {'//'}TERM
            </span>
            <span className="blink" style={{ color: '#00FF41' }}>_</span>
          </h1>

          <p className="text-sm mb-6 leading-relaxed max-w-sm" style={{ color: '#b9ccb2' }}>
            AI/tech news terminal with curated podcast episode archive.
            Signal active. Archive online.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            {latestEpisode && (
              <button
                onClick={() => play(latestEpisode)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all duration-150"
                style={{
                  background: '#00FF41',
                  color: '#131313',
                  boxShadow: '0 0 12px rgba(0,255,65,0.35)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,255,65,0.6)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,255,65,0.35)' }}
              >
                EXECUTE_LATEST_LOG_
              </button>
            )}
            <a
              href="#archive"
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all duration-150"
              style={{
                border: '1px solid rgba(0,255,65,0.35)',
                color: '#00FF41',
                background: 'transparent',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,255,65,0.8)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,255,65,0.35)' }}
            >
              BROWSE_ARCHIVE
            </a>
          </div>
        </div>

        {/* Thumbnail — grayscale noir treatment */}
        {latestEpisode?.thumbnailUrl ? (
          <div className="hidden lg:block rounded overflow-hidden aspect-video">
            <img
              src={latestEpisode.thumbnailUrl}
              alt={latestEpisode.title}
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(100%) contrast(1.2) brightness(0.75)' }}
            />
          </div>
        ) : (
          <div
            className="hidden lg:flex rounded aspect-video items-center justify-center"
            style={{ background: 'rgba(0,255,65,0.04)', border: '1px solid rgba(0,255,65,0.1)' }}
          >
            <span className="font-mono text-xs" style={{ color: 'rgba(0,255,65,0.3)' }}>
              ING_REF: 0x44A2
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
