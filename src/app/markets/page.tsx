import type { Metadata } from 'next'
import { getMarketSnapshot } from '@/lib/stocks'
import { MARKET_STATE_LABEL } from '@/types/stocks'
import QuoteCard from '@/components/markets/QuoteCard'
import MarketTable from '@/components/markets/MarketTable'
import SectorHeatmap from '@/components/markets/SectorHeatmap'
import Delta from '@/components/markets/Delta'
import Reveal from '@/components/ui/Reveal'
import SectionHeader from '@/components/ui/SectionHeader'
import { timeAgo } from '@/lib/format'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Markets',
  description: 'Tech equities and index proxies with 60-day trend lines and sector breadth.',
}

export default async function MarketsPage() {
  const snapshot = await getMarketSnapshot()
  const now = Date.now()

  const indices = snapshot.quotes.filter((q) => q.sector === 'Index')
  const equities = snapshot.quotes.filter((q) => q.sector !== 'Index')

  const best = [...equities].sort((a, b) => b.changePercent - a.changePercent)[0]
  const worst = [...equities].sort((a, b) => a.changePercent - b.changePercent)[0]

  const live = snapshot.marketState === 'REGULAR'
  const total = snapshot.advancers + snapshot.decliners
  const breadth = total > 0 ? (snapshot.advancers / total) * 100 : 0

  return (
    <div className="shell" style={{ paddingTop: 'calc(var(--header-h) + 56px)' }}>
      <header className="max-w-3xl">
        <p className="eyebrow eyebrow-accent flex items-center gap-2.5">
          <span className={live ? 'pulse' : 'pulse pulse-idle'} aria-hidden="true" />
          {MARKET_STATE_LABEL[snapshot.marketState]}
          {snapshot.updatedAt > 0 && (
            <>
              <span aria-hidden="true" className="h-2.5 w-px bg-hair-2" />
              <span style={{ color: 'var(--paper-3)' }}>
                updated {timeAgo(snapshot.updatedAt, now)} ago
              </span>
            </>
          )}
        </p>
        <h1 className="display mt-4 text-[clamp(38px,6vw,76px)]">Markets</h1>
        <p className="mt-5 max-w-[62ch] text-[16px] leading-relaxed text-paper-2">
          Index proxies, semiconductors, platforms and the infrastructure vendors underneath them.
          Quotes come from a live API when a key is configured and from end-of-day closes when it
          is not; the source column says which, per row.
        </p>
      </header>

      {snapshot.quotes.length === 0 ? (
        <div className="panel-flat my-14 px-6 py-20 text-center">
          <p className="display text-2xl text-paper">The board is dark.</p>
          <p className="mx-auto mt-3 max-w-[52ch] text-sm text-paper-2">
            Quotes are fetched on a schedule and cached. Either the window between runs is open or
            the upstream is unavailable — the end-of-day fallback covers the second case, so this
            usually means the first.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/news" className="btn btn-sm">
              Read the headlines <span aria-hidden="true">→</span>
            </Link>
            <Link href="/about" className="btn btn-sm">
              How this is built <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Indices + breadth */}
          <section className="mt-12" aria-label="Index proxies and breadth">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {indices.map((quote) => (
                <Reveal key={quote.symbol} className="h-full">
                  <QuoteCard quote={quote} emphasis now={now} showSource />
                </Reveal>
              ))}

              <Reveal delay={60} className="h-full">
                <div className="panel flex h-full flex-col justify-between gap-4 p-5">
                  <p className="eyebrow">Breadth</p>
                  <div>
                    <p className="num text-3xl font-medium tracking-tight text-paper">
                      {snapshot.advancers}
                      <span className="text-paper-3">/{total}</span>
                    </p>
                    <p className="mt-1 text-xs text-paper-3">advancing</p>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700"
                    role="img"
                    aria-label={`${snapshot.advancers} of ${total} tracked names advancing`}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${breadth}%`, background: 'var(--pos)' }}
                    />
                  </div>
                </div>
              </Reveal>

              {best && worst && (
                <Reveal delay={110} className="h-full">
                  <div className="panel flex h-full flex-col justify-between gap-4 p-5">
                    <p className="eyebrow">Session extremes</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="num text-sm text-paper">{best.symbol}</span>
                        <Delta changePercent={best.changePercent} />
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="num text-sm text-paper">{worst.symbol}</span>
                        <Delta changePercent={worst.changePercent} />
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </section>

          {/* Full board */}
          <section className="mt-20" aria-label="Full board">
            <Reveal>
              <SectionHeader index="01" eyebrow="Full board" title="Every tracked name" />
            </Reveal>
            <Reveal delay={60}>
              <div className="mt-8">
                <MarketTable quotes={snapshot.quotes} />
              </div>
            </Reveal>
          </section>

          {/* Heatmap */}
          <section className="mt-20 pb-8" aria-label="Sector heatmap">
            <Reveal>
              <SectionHeader
                index="02"
                eyebrow="By sector"
                title="Where the move is concentrated"
                description="Hue is direction, opacity is magnitude, capped at ±4% so one outlier can't wash out the board."
              />
            </Reveal>
            <Reveal delay={60}>
              <div className="mt-8">
                <SectorHeatmap quotes={snapshot.quotes} />
              </div>
            </Reveal>
          </section>
        </>
      )}
    </div>
  )
}
