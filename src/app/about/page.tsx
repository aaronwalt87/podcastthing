import type { Metadata } from 'next'
import Link from 'next/link'
import { activeLinks, profile } from '@/lib/profile'
import Reveal from '@/components/ui/Reveal'

export const metadata: Metadata = {
  title: 'About',
  description: `${profile.name} — 14 years in infrastructure and technology leadership, now learning to build and shipping real software.`,
}

const BUILD_NOTES: [string, string][] = [
  [
    'Rendering',
    'Server components by default. The browser gets JavaScript only when a feature actually needs it; it has enough responsibilities already.',
  ],
  [
    'Caching',
    'Scheduled jobs fetch feeds and quotes into Redis, so one sleepy publisher cannot hold the entire page hostage. If the cache fails, the site shows an honest empty state instead of a dramatic error page.',
  ],
  [
    'Charts',
    'There is no charting library. The trend lines are server-rendered SVG, and the animated ridge is a hand-written canvas. This was educational, which is the dignified way to say I made more work for myself.',
  ],
  [
    'Fallbacks',
    'Quotes use a live API when configured and end-of-day closes when it is not. The board labels the source because stale data is acceptable; pretending it is live is not.',
  ],
  [
    'Playback',
    'The player remembers each episode in your browser, supports speed and queue controls, and talks to the operating system. It does not require an account to remember that you stopped at 31:42.',
  ],
]

export default function AboutPage() {
  const links = activeLinks()

  return (
    <div className="shell" style={{ paddingTop: 'calc(var(--header-h) + 56px)' }}>
      <header className="max-w-3xl">
        <p className="eyebrow eyebrow-accent">The person behind the logs</p>
        <h1 className="display mt-4 text-[clamp(38px,6vw,76px)]">{profile.name}</h1>
        <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-paper-2">
          {profile.standfirst}
        </p>
      </header>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)] lg:gap-20">
        <div className="flex flex-col gap-12">
          {profile.about.map((section, i) => (
            <Reveal key={section.title} delay={i * 60}>
              <section>
                <h2 className="display text-[clamp(22px,2.6vw,30px)]">{section.title}</h2>
                <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-paper-2">
                  {section.body}
                </p>
              </section>
            </Reveal>
          ))}

          {profile.lookingFor.trim().length > 0 && (
            <Reveal>
              <section>
                <h2 className="display text-[clamp(22px,2.6vw,30px)]">
                  What I&rsquo;m looking for
                </h2>
                <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-paper-2">
                  {profile.lookingFor}
                </p>
              </section>
            </Reveal>
          )}

          <Reveal>
            <section>
              <h2 className="display text-[clamp(22px,2.6vw,30px)]">How I made this harder than necessary</h2>
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
          <div className="panel p-6">
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
                <code className="num text-ember">src/lib/profile.ts</code>. This note is
                development-only and never renders in production.
              </p>
            ) : null}
          </div>

          <div className="panel-flat p-6">
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

      <div className="mt-16 border-t border-hair py-10">
        <p className="display max-w-[24ch] text-[clamp(22px,2.6vw,32px)]">
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
