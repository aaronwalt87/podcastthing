'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { activeLinks, profile } from '@/lib/profile'
import styles from './Shell.module.css'

const SECTIONS = [
  { label: 'News', href: '/news' },
  { label: 'Markets', href: '/markets' },
  { label: 'Podcasts', href: '/podcasts' },
  { label: 'Decisions', href: '/decisions' },
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
    <footer className={styles.footer}>
      <div className={`shell ${styles.footerInner}`}>
      <div className={styles.footerTop}>
        <div className={styles.footerBio}>
          <p className={styles.footerStatement}>See you on<br />the next refresh.</p>
          <p className={styles.footerCopy}>
            A small corner of the internet, collected by {profile.name}.
          </p>
          <p className={`${styles.footerLabel} ${styles.footerStack}`}>Next.js · Redis · Vercel</p>
        </div>

        <nav aria-label="Sections">
          <p className={styles.footerLabel}>Take a look around</p>
          <ul role="list" className={styles.footerLinks}>
            {SECTIONS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
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
              <p className={styles.footerLabel}>Find me elsewhere</p>
              <ul role="list" className={styles.footerLinks}>
                {contact.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {link.label} {link.external && <span aria-hidden="true">↗</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className={styles.footerLabel}>Sources</p>
              <ul role="list" className={styles.footerLinks}>
                {SOURCES.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
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

      <div className={styles.footerWordmark}>
        <span>{profile.name}</span>
        <span className={styles.footerAsterisk} aria-hidden="true">✳</span>
      </div>
      <div className={styles.footerBottom}>
        <p>
          © <span className="num">{new Date().getFullYear()}</span> {profile.name}
        </p>
        <p>Refreshed while I do other things</p>
      </div>
      </div>
    </footer>
  )
}
