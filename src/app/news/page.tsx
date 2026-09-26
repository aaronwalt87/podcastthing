import type { Metadata } from 'next'
import Link from 'next/link'
import { getCachedNews } from '@/lib/news'
import NewsFeed from '@/components/news/NewsFeed'
import Reveal from '@/components/ui/Reveal'
import PageMasthead from '@/components/ui/PageMasthead'
import styles from '@/components/ui/PageMasthead.module.css'
import { timeAgo } from '@/lib/format'

export const dynamic = 'force-dynamic'
// A cold cache triggers a background refresh through waitUntil, which keeps the
// invocation alive but is still bounded by maxDuration — 10s by default, which
// a slow upstream can exceed.
export const maxDuration = 60

export const metadata: Metadata = {
  title: 'News',
  description:
    'Technology and infrastructure news I genuinely follow, cleaned up and refreshed on a schedule.',
}

export default async function NewsPage() {
  const items = await getCachedNews()
  const now = Date.now()

  const newest = items.length > 0 ? Math.max(...items.map((i) => i.publishedAt)) : 0
  const sources = new Set(items.map((i) => i.source)).size

  return (
    <div className={`shell ${styles.page}`}>
      <PageMasthead index="01" eyebrow="The reading room" title="News" meta={items.length > 0 ? (
        <dl className="flex flex-wrap gap-x-14 gap-y-5">
          <div><dt className="eyebrow">Headlines</dt><dd className="num m-0 mt-2 text-2xl">{items.length}</dd></div>
          <div><dt className="eyebrow">Sources</dt><dd className="num m-0 mt-2 text-2xl">{sources}</dd></div>
          <div><dt className="eyebrow">Newest</dt><dd className="num m-0 mt-2 text-2xl">{timeAgo(newest, now)} ago</dd></div>
        </dl>
      ) : undefined}>
        <p>
          The technology and infrastructure stories I genuinely want to keep up with, gathered from
          RSS, Atom, and Hacker News. The site cleans up duplicates, sorts everything by recency,
          and makes a reasonable attempt to classify the headlines. It is less glamorous than an
          algorithm and considerably less interested in making me angry.
        </p>

      </PageMasthead>

      <div className={styles.body}>
        {items.length === 0 ? (
          <div className="panel-flat px-6 py-20 text-center">
            <p className="display text-2xl text-paper">The feed is idle.</p>
            <p className="mx-auto mt-3 max-w-[52ch] text-sm text-paper-2">
              The scheduled refresh has not left anything in the cache yet. Nothing is necessarily broken;
              the robots may simply be between chores.
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
