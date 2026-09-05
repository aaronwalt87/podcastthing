'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { activeLinks, profile } from '@/lib/profile'

const SECTIONS = [
  { label: 'News', href: '/news' },
  { label: 'Markets', href: '/markets' },
  { label: 'Podcasts', href: '/podcasts' },
  { label: 'About', href: '/about' },
]

const SOURCES = [
  { label: 'Hacker News', href: 'https://news.ycombinator.com' },
  { label: 'Ars Technica', href: 'https://arstechnica.com' },
  { label: 'The Register', href: 'https://theregister.com' },
]

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  const contact = activeLinks()

  return (
    <footer className="mt-24 border-t border-hair">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="display text-2xl text-paper">{profile.name}</p>
          <p className="mt-2 max-w-[46ch] text-sm text-paper-2">
            Built and maintained in {profile.location}. A career in hosting, IT and support; now
            writing the code too.
          </p>
          <p className="eyebrow mt-5">Next.js · Redis · Vercel</p>
        </div>

        <nav aria-label="Sections">
          <p className="eyebrow">Sections</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {SECTIONS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-paper-2 transition-colors hover:text-paper"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={contact.length > 0 ? 'Elsewhere' : 'Sources'}>
          {contact.length > 0 ? (
            <>
              <p className="eyebrow">Elsewhere</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {contact.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-sm text-paper-2 transition-colors hover:text-paper"
                    >
                      {link.label} {link.external && <span aria-hidden="true">↗</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="eyebrow">Sources</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {SOURCES.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-paper-2 transition-colors hover:text-paper"
                    >
                      {link.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </nav>
      </div>

      <div className="shell flex flex-col gap-3 border-t border-hair py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="eyebrow">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="eyebrow">Refreshed on a schedule</p>
      </div>
    </footer>
  )
}
