import type { Metadata } from 'next'
import Link from 'next/link'
import { activeLinks, profile } from '@/lib/profile'
import { getMarketSnapshot } from '@/lib/stocks'
import Reveal from '@/components/ui/Reveal'
import SignalPlate from '@/components/home/SignalPlate'
import PageMasthead from '@/components/ui/PageMasthead'
import styles from '@/components/ui/PageMasthead.module.css'

export const metadata: Metadata = {
  title: 'Decisions',
  description:
    'The choices behind this site, the alternatives they beat, and the tradeoffs that came along for the ride.',
}

export const dynamic = 'force-dynamic'
// A cold cache triggers a background refresh through waitUntil, which keeps the
// invocation alive but is still bounded by maxDuration — 10s by default, which
// a slow upstream can exceed.
export const maxDuration = 60

export default async function DecisionsPage() {
  const { decisions } = profile
  const snapshot = await getMarketSnapshot()
  const links = activeLinks()
  const ridge = snapshot.quotes.find((q) => q.symbol === 'SPY') ?? snapshot.quotes[0] ?? null

  return (
    <div className={`shell ${styles.page}`}>
      <PageMasthead index="04" eyebrow="On the record" title="Decisions">
        <p>
          Every useful system is a pile of tradeoffs wearing a clean interface. These are the choices
          behind this one: what I picked, what I did not, and what the decision cost. If a choice has
          no downside, it is probably marketing copy wearing a hard hat.
        </p>
      </PageMasthead>

      {decisions.length === 0 ? (
        <div className="panel-flat my-14 px-6 py-20 text-center">
          <p className="display text-2xl text-paper">Nothing on the record yet.</p>
        </div>
      ) : (
        <ol role="list" className="flex flex-col pb-8">
          {decisions.map((decision, i) => (
            <Reveal key={decision.title} as="li" delay={i * 50}>
              {/* Choice and cost sit side by side rather than stacked in one
                  capped column — the trade-off is the point, and reading them
                  as a pair says so without a word of explanation. */}
              <article className={styles.decision}>
                <span aria-hidden="true" className={styles.decisionNumber}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div>
                  <h2 className={styles.storyTitle}>{decision.title}</h2>
                  <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-paper-2">
                    {decision.choice}
                  </p>
                </div>

                <div className={styles.cost}>
                  <p className="eyebrow">What it cost</p>
                  <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-paper-2">
                    {decision.cost}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      )}

      {/* The page that most argues this site is an authored instrument should
          carry the drawing. */}
      <div className="inverse-band mt-4 overflow-hidden rounded-[var(--r-3)]">
        <SignalPlate quote={ridge} height={148} />
      </div>

      <div className="py-10">
        <p className="max-w-[58ch] text-[15px] leading-relaxed text-paper-2">
          {links.length > 0
            ? 'Disagree with one of these? Good. Those are usually the useful conversations.'
            : // Without a contact route, an invitation to reply is a closed
              // loop — the same problem /about's closing block had.
              'Every one of these is visible in the source, costs and all. The pages below are the same decisions running.'}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="btn btn-sm"
            >
              {link.label} <span aria-hidden="true">{link.external ? '↗' : '→'}</span>
            </a>
          ))}
          <Link href="/markets" className="btn btn-sm">
            See them in effect <span aria-hidden="true">→</span>
          </Link>
          <Link href="/about" className="btn btn-sm">
            Who wrote this <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
