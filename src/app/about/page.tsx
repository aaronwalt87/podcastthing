import type { Metadata } from 'next'
import Link from 'next/link'
import { activeLinks, profile } from '@/lib/profile'
import Reveal from '@/components/ui/Reveal'

export const metadata: Metadata = {
  title: 'About',
  description: `${profile.name} — ${profile.tagline} A live technology news, markets and podcast dashboard, built and maintained in ${profile.location}.`,
}

const BUILD_NOTES: [string, string][] = [
  [
    'Rendering',
    'Server components by default. The news rows, trend lines and quote cards elsewhere on this site were rendered on the server; only the parts that need interactivity ship JavaScript.',
  ],
  [
    'Caching',
    'Feeds and quotes are fetched by scheduled jobs and cached in Redis, so a page load never waits on sixteen upstream services. A missing or failing cache degrades to an empty state, never to an error page.',
  ],
  [
    'Charts',
    'There is no charting library. The trend lines are server-rendered SVG, and the ridge on the home page is a hand-written canvas driven by the same market series shown on the board.',
  ],
  [
    'Fallbacks',
    'Quotes come from a live API when a key is configured and from end-of-day closes when it is not, so the board renders either way — and every quote records which source it came from.',
  ],
  [
    'Playback',
    'The player keeps a position per episode in your browser, supports variable speed and a queue, and registers with the operating system media controls.',
  ],
]

export default function AboutPage() {
  const links = activeLinks()

  return (
    <div className="shell" style={{ paddingTop: 'calc(var(--header-h) + 56px)' }}>
      <header className="max-w-3xl">
        <p className="eyebrow eyebrow-accent">Who is building this</p>
        <h1 className="display mt-4 text-[clamp(38px,6vw,76px)]">{profile.name}</h1>
        <p className="mt-6 max-w-[58ch] text-[17px] leading-relaxed text-paper-2">
          I have spent my career keeping other people&rsquo;s software running — hosting, IT,
          support, and the delivery process around all three. Recently I started writing the
          software myself. This site is where I do that in public.
        </p>
      </header>

      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.8fr)] lg:gap-20">
        <div className="flex flex-col gap-12">
          {profile.about.map((section, i) => (
            <Reveal key={section.title} delay={i * 60}>
              <section>
                <h2 className="eyebrow">{section.title}</h2>
                <p className="mt-3 max-w-[62ch] text-[16px] leading-relaxed text-paper-2">
                  {section.body}
                </p>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <section>
              <h2 className="eyebrow">How this one is built</h2>
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
                <ul className="mt-3 flex flex-col gap-2.5">
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
            ) : (
              <p className="mt-7 text-[13px] leading-relaxed text-paper-3">
                Contact links are set in{' '}
                <code className="num text-ember">src/lib/profile.ts</code> — fill one in and it
                appears here and in the footer.
              </p>
            )}
          </div>

          <div className="panel-flat p-6">
            <p className="eyebrow">Elsewhere on this site</p>
            <ul className="mt-3 flex flex-col gap-2.5">
              {[
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

      <div className="pb-8" />
    </div>
  )
}
