import type { Metadata } from 'next'
import Link from 'next/link'
import { activeLinks, profile } from '@/lib/profile'
import Reveal from '@/components/ui/Reveal'
import PageMasthead from '@/components/ui/PageMasthead'
import styles from '@/components/ui/PageMasthead.module.css'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${profile.name}'s personal collection of news, markets, and podcasts.`,
}

const BUILD_NOTES: [string, string][] = [
  [
    'Rendering',
    'Pages render on the server; interactive features run in the browser.',
  ],
  [
    'Caching',
    'Feeds and quotes refresh on a schedule and are cached in Redis for quick page loads.',
  ],
  [
    'Charts',
    'SVG trend lines and a hand-written canvas for the market ridge. No charting library.',
  ],
  [
    'Fallbacks',
    'Quotes use a live API when configured, or end-of-day closes. The source is always labeled.',
  ],
  [
    'Playback',
    'Playback positions stay in your browser. Queue and speed controls work without an account.',
  ],
]

export default function AboutPage() {
  const links = activeLinks()

  return (
    <div className={`shell ${styles.page}`}>
      <PageMasthead index="05" eyebrow="A little context" title="About this site">
        <p>
          {profile.standfirst}
        </p>
      </PageMasthead>

      <div className={styles.storyLayout}>
        <div>
          {profile.about.map((section, i) => (
            <Reveal key={section.title} delay={i * 60}>
              <section className={styles.story}>
                <p className="eyebrow mb-6"><span className="num">0{i + 1}</span> / The project</p>
                <h2 className={styles.storyTitle}>{section.title}</h2>
                <p className={styles.storyCopy}>
                  {section.body}
                </p>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <section className={styles.story}>
              <p className="eyebrow mb-6">Under the hood</p>
              <h2 className={styles.storyTitle}>How it works</h2>
              <dl className="mt-5 flex flex-col">
                {BUILD_NOTES.map(([term, detail]) => (
                  <div
                    key={term}
                    className="grid gap-1 border-t border-hair py-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-6"
                  >
                    <dt className="num text-xs uppercase tracking-wider text-paper-2">{term}</dt>
                    <dd className="m-0 max-w-[58ch] text-[15px] leading-relaxed text-paper-2">
                      {detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <div className={styles.contactCard}>
            <p className="mb-12 text-6xl tracking-[-0.08em]" aria-hidden="true">AW<span className="text-ember">.</span></p>
            <p className="eyebrow">Based in</p>
            <p className="mt-2 text-[15px] text-paper">{profile.location}</p>

            {links.length > 0 ? (
              <>
                <p className="eyebrow mt-7">Reach me</p>
                <ul role="list" className="mt-3 flex flex-col gap-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="link-draw text-[15px]"
                      >
                        {link.label} {link.external && <span aria-hidden="true">↗</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : process.env.NODE_ENV !== 'production' ? (
              // Development only — a visitor must never be shown a TODO, least
              // of all in the slot where the contact details belong.
              <p className="mt-7 text-[13px] leading-relaxed text-paper-3">
                No contact links yet — set them in{' '}
                <code className="num text-ember-soft">src/lib/profile.ts</code>. This note is
                development-only and never renders in production.
              </p>
            ) : null}
          </div>

          <div className="border-t border-hair-2 py-6">
            <p className="eyebrow">Elsewhere on this site</p>
            <ul role="list" className="mt-3 flex flex-col gap-2.5">
              {[
                { label: 'Decisions, and what they cost', href: '/decisions' },
                { label: 'The news feed', href: '/news' },
                { label: 'The market board', href: '/markets' },
                { label: 'The listening archive', href: '/podcasts' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[15px] text-paper-2 transition-colors hover:text-paper"
                  >
                    {item.label} <span aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className={styles.closing}>
        <p className={styles.storyTitle}>
          See a decision you would have made differently?
        </p>
        <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-paper-2">
          That is probably the most interesting conversation we could have.{' '}
          {links.length > 0
            ? 'Any of the links above reaches me.'
            : // With no contact link configured, an invitation to reply would be
              // a closed loop. Point at something the reader can verify instead.
              'Every choice here is on the record — literally: the decisions page names each one and what it cost.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/decisions" className="btn btn-sm">
            Read the decisions <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
