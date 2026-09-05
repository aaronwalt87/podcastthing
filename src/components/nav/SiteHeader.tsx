'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LINKS = [
  { label: 'Podcasts', href: '/podcasts' },
  { label: 'News', href: '/news' },
  { label: 'Markets', href: '/markets' },
]

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

/** Three ascending strokes — a ridge line and a rising signal at the same time. */
function BrandMark() {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" aria-hidden="true">
      <path
        d="M1 19L7 8l5 6 4-9 8 14"
        stroke="var(--ember)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)

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

  if (pathname.startsWith('/admin')) return null

  const openPalette = () => window.dispatchEvent(new Event('signal:open-palette'))

  return (
    <header
      className="fixed inset-x-0 top-0 z-[100] transition-[background-color,border-color,backdrop-filter] duration-300"
      style={{
        height: 'var(--header-h)',
        backgroundColor: scrolled || menuOpen ? 'rgba(7,8,10,0.82)' : 'transparent',
        borderBottom: `1px solid ${scrolled || menuOpen ? 'var(--hair)' : 'transparent'}`,
        backdropFilter: scrolled || menuOpen ? 'blur(16px) saturate(1.3)' : 'none',
        WebkitBackdropFilter: scrolled || menuOpen ? 'blur(16px) saturate(1.3)' : 'none',
      }}
    >
      <div className="shell flex h-full items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Aaron Walters — home">
          <BrandMark />
          <span className="hidden sm:block">
            <span className="block text-[13px] font-medium leading-tight text-paper">
              Aaron Walters
            </span>
            <span className="eyebrow block leading-tight">Signal</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map(({ label, href }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative px-3 py-2 text-[13px] transition-colors ${
                  active ? 'text-paper' : 'text-paper-2 hover:text-paper'
                }`}
              >
                {label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 -bottom-px h-px"
                    style={{ background: 'var(--ember)' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={openPalette}
          className="ml-auto flex h-9 items-center gap-2.5 rounded-sm border border-hair bg-ink-900/60 px-3 text-xs text-paper-3 transition-colors hover:border-hair-2 hover:text-paper-2 md:ml-0"
          aria-label="Open search"
        >
          <span aria-hidden="true">⌕</span>
          <span className="hidden lg:inline">Search</span>
          <kbd className="num hidden text-[10px] opacity-70 lg:inline">
            {isMac ? '⌘' : 'Ctrl '}K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="btn btn-icon md:hidden"
          style={{ borderColor: 'var(--hair)' }}
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

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-b border-hair bg-ink-950/95 backdrop-blur md:hidden"
        >
          <div className="shell flex flex-col py-2">
            {LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(pathname, href) ? 'page' : undefined}
                className={`border-b border-hair py-3.5 text-[15px] last:border-0 ${
                  isActive(pathname, href) ? 'text-ember' : 'text-paper'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
