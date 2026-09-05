import Link from 'next/link'
import { getAllEpisodes } from '@/lib/episodes'
import { getCachedNews } from '@/lib/news'
import { getMarketSnapshot } from '@/lib/stocks'
import Hero from '@/components/home/Hero'
import SignalField from '@/components/home/SignalField'
import MarketStrip from '@/components/markets/MarketStrip'
import QuoteCard from '@/components/markets/QuoteCard'
import NewsDigest from '@/components/news/NewsDigest'
import EpisodeCard from '@/components/podcasts/EpisodeCard'
import EpisodeIndex from '@/components/podcasts/EpisodeIndex'
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
  const sourceCount = new Set(news.map((item) => item.source)).size

  const [featured, ...rest] = episodes
  const indexed = rest.slice(0, 4)

  const indices = snapshot.quotes.filter((q) => q.sector === 'Index')
  const movers = snapshot.quotes
    .filter((q) => q.sector !== 'Index')
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 4 - Math.min(indices.length, 2))

  const spotlight = [...indices.slice(0, 2), ...movers]
  const ridge = snapshot.quotes.find((q) => q.symbol === 'QQQ') ?? snapshot.quotes[0] ?? null

  return (
    <>
      <Hero
        latestEpisode={featured ?? null}
        headlineCount={news.length}
        sourceCount={sourceCount}
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
            description="Headlines from every tech and infrastructure feed worth reading, plus the Hacker News index — parsed server-side and cached, with the tape underneath them."
            action={{ label: 'All headlines', href: '/news' }}
          />
        </Reveal>

        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-[1.35fr_1fr]">
          <Reveal className="h-full">
            <NewsDigest items={news} now={now} limit={8} />
          </Reveal>

          <Reveal delay={90} className="h-full">
            <div className="flex h-full flex-col gap-5">
              {spotlight.length > 0 ? (
                <>
                  <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 sm:grid-rows-2">
                    {spotlight.map((quote, i) => (
                      <QuoteCard key={quote.symbol} quote={quote} emphasis={i < 2} />
                    ))}
                  </div>
                  <Link
                    href="/markets"
                    className="panel-flat flex shrink-0 items-center justify-between px-4 py-3.5 text-sm text-paper-2 transition-colors hover:bg-white/[0.03] hover:text-paper"
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
                <div className="panel-flat flex flex-1 flex-col justify-center px-6 py-12 text-center">
                  <p className="eyebrow">Market feed idle</p>
                  <p className="mx-auto mt-2 max-w-[42ch] text-sm text-paper-2">
                    Quotes are fetched on a schedule and cached. Nothing is cached right now — the
                    board refills on the next run.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* The ridge returns as a full-bleed band so the page has a second event
          and the hero canvas reads as an identity rather than decoration. */}
      <div className="relative h-[132px] overflow-hidden border-y border-hair">
        <div className="absolute inset-0 -z-10 opacity-70">
          <SignalField series={ridge?.history ?? []} />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, var(--ink-950) 0%, rgba(7,8,10,0.35) 30%, rgba(7,8,10,0.35) 70%, var(--ink-950) 100%)',
          }}
        />
      </div>

      {/* --------------------------------------------------------- archive -- */}
      <section id="archive" className="shell py-20 md:pb-28 md:pt-32">
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow="Listening archive"
            title="Episodes worth finishing"
            description="Hand-picked, not a feed — the ones I'd send a colleague, on infrastructure, AI, and how technology work actually gets done. Playback picks up where you left it."
            action={{ label: 'Full archive', href: '/podcasts' }}
          />
        </Reveal>

        {episodes.length === 0 ? (
          <div className="panel-flat mt-10 px-6 py-20 text-center">
            <p className="display text-2xl text-paper">Nothing in the archive yet.</p>
            <p className="mx-auto mt-3 max-w-[46ch] text-sm text-paper-2">
              This is a curated list rather than a firehose — episodes land here as they turn out to
              be worth the time.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/news" className="btn btn-sm">
                Read the headlines <span aria-hidden="true">→</span>
              </Link>
              <Link href="/markets" className="btn btn-sm">
                See the board <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-2">
            {featured && (
              <Reveal>
                <EpisodeCard episode={featured} queue={episodes} featured />
              </Reveal>
            )}

            {indexed.length > 0 && (
              <Reveal delay={80}>
                <EpisodeIndex episodes={indexed} queue={episodes} startAt={2} />
              </Reveal>
            )}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------- about -- */}
      <section className="shell pb-24">
        <Reveal>
          <div className="panel grid gap-10 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div className="max-w-2xl">
              <p className="eyebrow eyebrow-accent">About this build</p>
              <p className="display mt-4 max-w-[22ch] text-[clamp(26px,3.4vw,42px)]">
                I&rsquo;ve run infrastructure for years. This is what happened when I started
                writing the code myself.
              </p>
              <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-paper-2">
                Everything here is fetched, cached and refreshed on a schedule — feeds parsed
                server-side and deduplicated into Redis, quotes from a live API with a keyless
                daily-close fallback so the board still renders when the upstream is down, and a
                player that keeps your position per episode and talks to the OS media controls. The
                decisions are the interesting part, and I&rsquo;ll happily defend any of them.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/about" className="btn btn-primary btn-sm">
                  Read the full story <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <ul className="flex flex-col gap-3 text-sm text-paper-2 md:w-56">
              {[
                'Next.js App Router',
                'Server components by default',
                'Upstash Redis cache',
                'Scheduled refresh jobs',
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
