'use client'

import Link from 'next/link'
import SignalField from './SignalField'
import PlayButton from '@/components/podcasts/PlayButton'
import { MARKET_STATE_LABEL } from '@/lib/stocks'
import type { Episode } from '@/types/episode'
import type { MarketSnapshot } from '@/types/stocks'

interface HeroProps {
  latestEpisode: Episode | null
  episodeCount: number
  headlineCount: number
  snapshot: MarketSnapshot
}

/** One cell of the hero stat list. `div` grouping inside `dl` is valid HTML5. */
function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="eyebrow">{label}</dt>
      <dd className="num m-0 text-lg text-paper" style={tone ? { color: tone } : undefined}>
        {value}
      </dd>
    </div>
  )
}

export default function Hero({
  latestEpisode,
  episodeCount,
  headlineCount,
  snapshot,
}: HeroProps) {
  // Prefer the broad index for the ridge line; fall back to whatever we have.
  const lead =
    snapshot.quotes.find((q) => q.symbol === 'SPY') ?? snapshot.quotes[0] ?? null
  const series = lead?.history ?? []
  const live = snapshot.marketState === 'REGULAR'

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <SignalField series={series} />
        {/* Vertical scrim seats the field into the page… */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(7,8,10,0.72) 0%, rgba(7,8,10,0.18) 40%, rgba(7,8,10,0.86) 88%, var(--ink-950) 100%)',
          }}
        />
        {/* …and a horizontal one keeps the ridge from crossing the headline. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, var(--ink-950) 0%, rgba(7,8,10,0.86) 34%, rgba(7,8,10,0.1) 68%, transparent 100%)',
          }}
        />
      </div>

      <div
        className="shell flex flex-col justify-end"
        style={{
          minHeight: 'min(92vh, 820px)',
          paddingTop: 'calc(var(--header-h) + 40px)',
          paddingBottom: '48px',
        }}
      >
        <p className="eyebrow flex items-center gap-2.5">
          <span className={live ? 'pulse' : 'pulse pulse-idle'} aria-hidden="true" />
          {MARKET_STATE_LABEL[snapshot.marketState]}
          <span aria-hidden="true" className="h-2.5 w-px bg-hair-2" />
          Denver, Colorado
        </p>

        <h1
          id="hero-title"
          className="display mt-6 max-w-4xl text-[clamp(44px,8vw,104px)]"
        >
          The whole signal,
          <br />
          <span className="text-paper-2">on one page.</span>
        </h1>

        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-paper-2">
          I run infrastructure for a living, so I built the dashboard I actually wanted: technology
          news, the market underneath it, and the episodes worth finishing — collected, cached, and
          refreshed on a schedule.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/news" className="btn btn-primary">
            Open the feed
          </Link>

          {latestEpisode && (
            <div className="flex min-w-0 items-center gap-3 rounded-md border border-hair bg-ink-900/70 py-2 pl-2 pr-5 backdrop-blur">
              <PlayButton episode={latestEpisode} size="md" />
              <span className="min-w-0">
                <span className="eyebrow block leading-tight">Latest episode</span>
                <span className="mt-0.5 block max-w-[40ch] truncate text-[13px] leading-tight text-paper">
                  {latestEpisode.title}
                </span>
              </span>
            </div>
          )}
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-hair pt-6 sm:grid-cols-4 lg:mt-16">
          <Stat label="Headlines tracked" value={String(headlineCount)} />
          <Stat label="Episodes archived" value={String(episodeCount)} />
          <Stat
            label="Advancing"
            value={String(snapshot.advancers)}
            tone={snapshot.advancers > 0 ? 'var(--pos)' : undefined}
          />
          <Stat
            label="Declining"
            value={String(snapshot.decliners)}
            tone={snapshot.decliners > 0 ? 'var(--neg)' : undefined}
          />
        </dl>
      </div>
    </section>
  )
}
