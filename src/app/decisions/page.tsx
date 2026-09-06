import type { Metadata } from 'next'
import Link from 'next/link'
import { activeLinks, profile } from '@/lib/profile'
import { getMarketSnapshot } from '@/lib/stocks'
import Reveal from '@/components/ui/Reveal'
import SignalPlate from '@/components/home/SignalPlate'

export const metadata: Metadata = {
  title: 'Decisions',
  description:
    'A record of the choices made in building this site, the alternatives they were chosen over, and what each one cost.',
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
    <div className="shell" style={{ paddingTop: 'calc(var(--header-h) + 56px)' }}>
      <header className="max-w-3xl">
        <p className="eyebrow eyebrow-accent">On the record</p>
        <h1 className="display mt-4 text-[clamp(38px,6vw,76px)]">Decisions</h1>
        <p className="mt-6 max-w-[62ch] text-[17px] leading-relaxed text-paper-2">
          Every part of this site is a choice that could have gone the other way. These are the ones
          worth defending, each with the alternative it beat and the price it charged. An entry with
          no cost isn&rsquo;t a decision — it&rsquo;s an advertisement.
        </p>
      </header>

      {decisions.length === 0 ? (
        <div className="panel-flat my-14 px-6 py-20 text-center">
          <p className="display text-2xl text-paper">Nothing on the record yet.</p>
        </div>
      ) : (
        <ol role="list" className="mt-14 flex flex-col pb-8">
          {decisions.map((decision, i) => (
            <Reveal key={decision.title} as="li" delay={i * 50}>
              {/* Choice and cost sit side by side rather than stacked in one
                  capped column — the trade-off is the point, and reading them
                  as a pair says so without a word of explanation. */}
              <article className="grid gap-5 border-t border-hair py-9 md:grid-cols-[2.5rem_minmax(0,1.05fr)_minmax(0,1fr)] md:gap-10">
                <span aria-hidden="true" className="num text-xs text-paper-3 md:pt-2">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div>
                  <h2 className="display text-[clamp(22px,2.8vw,32px)]">{decision.title}</h2>
                  <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-paper-2">
                    {decision.choice}
                  </p>
                </div>

                <div className="border-l-0 border-hair md:border-l md:pl-10">
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
      <div className="-mx-[max(18px,4vw)] mt-4">
        <SignalPlate quote={ridge} height={148} />
      </div>

      <div className="border-t border-hair py-10">
        <p className="max-w-[58ch] text-[15px] leading-relaxed text-paper-2">
          {links.length > 0
            ? 'Disagree with one of these? That’s the conversation worth having.'
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
