import Link from 'next/link'
import { getAllEpisodes } from '@/lib/episodes'
import { getCachedNews } from '@/lib/news'
import { getMarketSnapshot } from '@/lib/stocks'
import Hero from '@/components/home/Hero'
import MarketStrip from '@/components/markets/MarketStrip'
import QuoteCard from '@/components/markets/QuoteCard'
import NewsDigest from '@/components/news/NewsDigest'
import EpisodeCard from '@/components/podcasts/EpisodeCard'
import SectionHeader from '@/components/ui/SectionHeader'
import Reveal from '@/components/ui/Reveal'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [episodes, news, snapshot] = await Promise.all([
    getAllEpisodes(),
    getCachedNews(),
    getMarketSnapshot(),
  ])

  // One timestamp for the whole render so relative ages don't drift on hydration.
  const now = Date.now()

  const [featured, ...rest] = episodes
  const secondary = rest.slice(0, 2)

  const indices = snapshot.quotes.filter((q) => q.sector === 'Index')
  const movers = snapshot.quotes
    .filter((q) => q.sector !== 'Index')
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 4 - Math.min(indices.length, 2))

  const spotlight = [...indices.slice(0, 2), ...movers]

  return (
    <>
      <Hero
        latestEpisode={featured ?? null}
        episodeCount={episodes.length}
        headlineCount={news.length}
        snapshot={snapshot}
      />

      <MarketStrip snapshot={snapshot} />

      {/* ---------------------------------------------------------- signal -- */}
      <section id="signal" className="shell py-20 md:py-28">
        <Reveal>
          <SectionHeader
            index="01"
            eyebrow="Live intelligence"
            title="What's moving right now"
            description="Headlines pulled from sixteen sources and the tech tape underneath them, cached server-side and refreshed on a cron."
            action={{ label: 'All headlines', href: '/news' }}
          />
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Reveal>
            <NewsDigest items={news} now={now} limit={8} />
          </Reveal>

          <Reveal delay={90}>
            <div className="flex flex-col gap-4">
              {spotlight.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {spotlight.map((quote, i) => (
                      <QuoteCard key={quote.symbol} quote={quote} emphasis={i < 2} />
                    ))}
                  </div>
                  <Link
                    href="/markets"
                    className="panel-flat flex items-center justify-between px-4 py-3.5 text-sm text-paper-2 transition-colors hover:bg-white/[0.03] hover:text-paper"
                  >
                    <span>
                      <span className="num" style={{ color: 'var(--pos)' }}>
                        {snapshot.advancers}
                      </span>{' '}
                      up ·{' '}
                      <span className="num" style={{ color: 'var(--neg)' }}>
                        {snapshot.decliners}
                      </span>{' '}
                      down
                    </span>
                    <span>
                      Full board <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </>
              ) : (
                <div className="panel-flat px-6 py-12 text-center">
                  <p className="eyebrow">Market feed idle</p>
                  <p className="mt-2 text-sm text-paper-2">
                    Quotes refresh on a schedule. Nothing is cached right now.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="shell">
        <hr className="rule" />
      </div>

      {/* --------------------------------------------------------- archive -- */}
      <section id="archive" className="shell py-20 md:py-28">
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow="Listening archive"
            title="Episodes worth finishing"
            description="Conversations on infrastructure, AI, and how technology work actually gets done. Playback picks up where you left it."
            action={{ label: 'Full archive', href: '/podcasts' }}
          />
        </Reveal>

        {episodes.length === 0 ? (
          <div className="panel-flat mt-10 px-6 py-20 text-center">
            <p className="display text-2xl text-paper">The archive is empty.</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-paper-2">
              Episodes added through the admin panel appear here.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            {featured && (
              <Reveal className="h-full">
                <EpisodeCard episode={featured} queue={episodes} featured />
              </Reveal>
            )}

            {secondary.length > 0 && (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                {secondary.map((ep, i) => (
                  <Reveal key={ep.id} delay={70 * (i + 1)} className="h-full">
                    <EpisodeCard episode={ep} queue={episodes} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------- about -- */}
      <section className="shell pb-24">
        <Reveal>
          <div className="panel grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div className="max-w-2xl">
              <p className="eyebrow eyebrow-accent">Colophon</p>
              <p className="display mt-4 text-[clamp(24px,3.2vw,38px)]">
                Everything here is real data on a schedule — no mock numbers, no placeholder
                telemetry.
              </p>
              <p className="mt-5 text-[15px] leading-relaxed text-paper-2">
                Headlines are parsed from RSS and Atom feeds plus the Hacker News index, deduplicated
                by content hash, and cached in Redis. Quotes come from a live API with a keyless
                daily-close fallback, so the board still renders when the upstream is down. The
                player keeps your position per episode and talks to the OS media controls.
              </p>
            </div>

            <ul className="flex flex-col gap-3 text-sm text-paper-2 md:w-56">
              {[
                'Next.js App Router',
                'Server components by default',
                'Upstash Redis cache',
                'Vercel cron refresh',
                'No client-side chart library',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-ember" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </>
  )
}
