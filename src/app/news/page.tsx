import type { Metadata } from 'next'
import Link from 'next/link'
import { getCachedNews } from '@/lib/news'
import NewsFeed from '@/components/news/NewsFeed'
import Reveal from '@/components/ui/Reveal'
import { timeAgo } from '@/lib/format'

export const dynamic = 'force-dynamic'
// A cold cache triggers a background refresh through waitUntil, which keeps the
// invocation alive but is still bounded by maxDuration — 10s by default, which
// a slow upstream can exceed.
export const maxDuration = 60

export const metadata: Metadata = {
  title: 'News',
  description:
    'AI, hardware, infrastructure and tech-finance headlines, parsed server-side and refreshed on a schedule.',
}

export default async function NewsPage() {
  const items = await getCachedNews()
  const now = Date.now()

  const newest = items.length > 0 ? Math.max(...items.map((i) => i.publishedAt)) : 0
  const sources = new Set(items.map((i) => i.source)).size

  return (
    <div className="shell" style={{ paddingTop: 'calc(var(--header-h) + 56px)' }}>
      <header className="max-w-3xl">
        <p className="eyebrow eyebrow-accent">Live intelligence</p>
        <h1 className="display mt-4 text-[clamp(38px,6vw,76px)]">News</h1>
        <p className="mt-5 max-w-[62ch] text-[16px] leading-relaxed text-paper-2">
          RSS, Atom and the Hacker News index, parsed server-side, deduplicated by normalised link,
          and sorted newest first. Headlines are classified by keyword, so a story lands in the
          section it belongs to rather than the one its publisher sits in.
        </p>

        {items.length > 0 && (
          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="eyebrow">Headlines</dt>
              <dd className="num m-0 mt-1 text-lg text-paper">{items.length}</dd>
            </div>
            <div>
              <dt className="eyebrow">Sources</dt>
              <dd className="num m-0 mt-1 text-lg text-paper">{sources}</dd>
            </div>
            <div>
              <dt className="eyebrow">Newest</dt>
              <dd className="num m-0 mt-1 text-lg text-paper">{timeAgo(newest, now)} ago</dd>
            </div>
          </dl>
        )}
      </header>

      <div className="mt-12 pb-8">
        {items.length === 0 ? (
          <div className="panel-flat px-6 py-20 text-center">
            <p className="display text-2xl text-paper">The feed is idle.</p>
            <p className="mx-auto mt-3 max-w-[52ch] text-sm text-paper-2">
              Headlines are fetched on a schedule and cached; the cache is empty between runs or
              just after a deploy. Nothing is broken — it refills on the next pass.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/markets" className="btn btn-sm">
                See the market board <span aria-hidden="true">→</span>
              </Link>
              <Link href="/podcasts" className="btn btn-sm">
                Browse the archive <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ) : (
          <Reveal>
            <NewsFeed items={items} now={now} />
          </Reveal>
        )}
      </div>
    </div>
  )
}
