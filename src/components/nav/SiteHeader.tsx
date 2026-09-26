'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { profile } from '@/lib/profile'
import styles from '../Shell.module.css'

const LINKS = [
  { label: 'News', href: '/news' },
  { label: 'Markets', href: '/markets' },
  { label: 'Podcasts', href: '/podcasts' },
  { label: 'Decisions', href: '/decisions' },
  { label: 'About', href: '/about' },
]

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

/** A custom AW ligature held in a quiet orbital brand system. */
function BrandMark() {
  return (
    <svg className={styles.brandMark} width="58" height="44" viewBox="0 0 58 44" fill="none" aria-hidden="true">
      <ellipse className={styles.brandOrbit} cx="29" cy="22" rx="26" ry="19" />
      <path
        className={styles.brandLigature}
        d="M12 31L21 11L30 31L37 14L42 31L47 11M15 24H27"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="square"
        strokeLinejoin="bevel"
      />
      <g className={styles.brandSatellite}><circle cx="55" cy="22" r="2.6" /></g>
    </svg>
  )
}

export default function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
  }, [])

  // A route change should never leave the mobile sheet hanging open.
  useEffect(() => setMenuOpen(false), [pathname])

  // Escape closes the disclosure and returns focus to its trigger.
  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuToggleRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  if (pathname.startsWith('/admin')) return null

  const openPalette = () => window.dispatchEvent(new Event('signal:open-palette'))

  return (
    <header className={`${styles.header} ${scrolled || menuOpen ? styles.headerScrolled : ''}`}>
      <div className={`shell ${styles.headerInner}`}>
        <Link href="/" className={styles.brand} aria-label={`${profile.name} — home`}>
          <BrandMark />
          <span className={styles.brandName}>
            Aaron<br />Walters<span className={styles.brandDot}>.</span>
          </span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          {LINKS.map(({ label, href }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={styles.navLink}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => { setMenuOpen(false); openPalette() }}
          className={styles.searchButton}
          aria-label="Open search"
        >
          <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className={styles.searchLabel}>Search</span>
          <kbd className={`num ${styles.searchKey}`}>
            {isMac ? '⌘' : 'Ctrl '}K
          </kbd>
        </button>

        <button
          ref={menuToggleRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className={styles.menuButton}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d={menuOpen ? 'M3 3l10 10M13 3L3 13' : 'M2 4h12M2 8h12M2 12h12'}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <nav
        id="mobile-nav"
        hidden={!menuOpen}
        aria-label="Primary"
        className={styles.mobileNav}
      >
        <div className={`shell ${styles.mobileNavInner}`}>
          {LINKS.map(({ label, href }, index) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
              className={styles.mobileNavLink}
            >
              <span><small className="num" aria-hidden="true">0{index + 1}</small>{label}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
