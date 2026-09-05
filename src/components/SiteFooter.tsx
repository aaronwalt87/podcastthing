'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const COLUMNS = [
  {
    title: 'Sections',
    links: [
      { label: 'Podcasts', href: '/podcasts' },
      { label: 'News', href: '/news' },
      { label: 'Markets', href: '/markets' },
    ],
  },
  {
    title: 'Sources',
    links: [
      { label: 'Hacker News', href: 'https://news.ycombinator.com', external: true },
      { label: 'Ars Technica', href: 'https://arstechnica.com', external: true },
      { label: 'The Register', href: 'https://theregister.com', external: true },
    ],
  },
]

export default function SiteFooter() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="mt-24 border-t border-hair">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="display text-2xl text-paper">Aaron Walters</p>
          <p className="mt-2 max-w-sm text-sm text-paper-2">
            Technology news, market signal, and a listening archive — assembled in one place and
            kept current on a schedule.
          </p>
          <p className="eyebrow mt-5">Built with Next.js · Redis · Vercel</p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="eyebrow">{column.title}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  {'external' in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-paper-2 transition-colors hover:text-paper"
                    >
                      {link.label} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-paper-2 transition-colors hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="shell flex flex-col gap-3 border-t border-hair py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="eyebrow">© {new Date().getFullYear()} Aaron Walters</p>
        <Link href="/admin" className="eyebrow transition-colors hover:text-paper-2">
          Admin
        </Link>
      </div>
    </footer>
  )
}
