import Link from 'next/link'
import { getAllEpisodes } from '@/lib/episodes'
import { getCachedNews } from '@/lib/news'
import { getMarketSnapshot } from '@/lib/stocks'
import Hero from '@/components/home/Hero'
import SignalPlate from '@/components/home/SignalPlate'
import MarketStrip from '@/components/markets/MarketStrip'
import QuoteCard from '@/components/markets/QuoteCard'
import NewsDigest from '@/components/news/NewsDigest'
import EpisodeCard from '@/components/podcasts/EpisodeCard'
import EpisodeIndex from '@/components/podcasts/EpisodeIndex'
import SectionHeader from '@/components/ui/SectionHeader'
import Reveal from '@/components/ui/Reveal'
import ScrollScene from '@/components/ui/ScrollScene'
import styles from './Home.module.css'

export const dynamic = 'force-dynamic'
// A cold cache triggers a background refresh through waitUntil, which keeps the
// invocation alive but is still bounded by maxDuration — 10s by default, which
// a slow upstream can exceed.
export const maxDuration = 60

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
  // Only what is on the page: passing the full archive would serialise every
  // episode's fields into the payload twice, growing without bound.
  const homeQueue = featured ? [featured, ...indexed] : []

  const indices = snapshot.quotes.filter((q) => q.sector === 'Index')
  const movers = snapshot.quotes
    .filter((q) => q.sector !== 'Index')
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 4 - Math.min(indices.length, 2))

  const spotlight = [...indices.slice(0, 2), ...movers]
  const ridge = snapshot.quotes.find((q) => q.symbol === 'SPY') ?? snapshot.quotes[0] ?? null

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
      <section id="signal" className={`shell ${styles.chapter}`}>
        <Reveal>
          <SectionHeader
            index="01"
            eyebrow="Live intelligence"
            title="What's moving right now"
            description="Technology and infrastructure headlines, gathered in one feed."
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
                    className="panel-flat flex shrink-0 items-center justify-between px-4 py-3.5 text-sm text-paper-2 transition-colors hover:text-paper"
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

      <ScrollScene>
      <section className={`inverse-band ${styles.interlude}`} aria-labelledby="working-title">
        <div className="shell">
          <p className="eyebrow">Pick a starting point</p>
          <div className={styles.interludeGrid}>
            <div data-scroll-layer="back"><h2 id="working-title" className={styles.interludeTitle}>Read. Listen.<br /><span>Catch up.</span></h2></div>
            <div data-scroll-layer="front">
              <div className={styles.principles}>
                {[{ label: 'The news feed', href: '/news' }, { label: 'The market board', href: '/markets' }, { label: 'The listening list', href: '/podcasts' }].map(({ label, href }, index) => (
                  <Link href={href} className={styles.principle} key={label}><span>0{index + 1}</span><strong>{label}</strong><span aria-hidden="true">↗</span></Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <SignalPlate quote={ridge} height={140} />
      </section>
      </ScrollScene>

      {/* --------------------------------------------------------- archive -- */}
      <ScrollScene>
      <div className={styles.listening}>
      <section id="archive" className={`shell ${styles.chapter}`}>
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow="Listening archive"
            title="Episodes worth finishing"
            description="A hand-picked listening list. Pick an episode and carry on where you left off."
            action={{ label: 'Full archive', href: '/podcasts' }}
          />
        </Reveal>

        {episodes.length === 0 ? (
          <div className="panel-flat mt-10 px-6 py-20 text-center">
            <p className="display text-2xl text-paper">Nothing in the archive yet.</p>
            <p className="mx-auto mt-3 max-w-[46ch] text-sm text-paper-2">
              This is a curated list, not an RSS guilt pile. Episodes land here after they prove
              they were worth the time.
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
                <EpisodeCard episode={featured} queue={homeQueue} featured indexLabel={1} />
              </Reveal>
            )}

            {indexed.length > 0 && (
              <Reveal delay={80}>
                <EpisodeIndex episodes={indexed} queue={homeQueue} startAt={2} />
              </Reveal>
            )}
          </div>
        )}
      </section>
      </div>
      </ScrollScene>

      {/* ----------------------------------------------------------- about -- */}
      <section className="shell">
        <Reveal>
          {/* Two columns that both carry weight: the claim on the left, the
              evidence and the way in on the right. A single capped column left
              half the panel empty. */}
          <div className={styles.build}>
            <div>
              <p className="eyebrow eyebrow-accent">About this build</p>
              <h2 className={styles.buildTitle}>
                A useful little side project.
              </h2>
            </div>

            <div className={styles.buildText}>
              <p className="max-w-[54ch] text-[15px] leading-relaxed text-paper-2">
                Feeds refresh on a schedule. The player remembers your place.
                The decisions page explains the choices behind it all.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/decisions" className="btn btn-primary btn-sm">
                  Read the decisions <span aria-hidden="true">→</span>
                </Link>
                <Link href="/about" className="btn btn-sm">
                  About the site <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
