'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/#news' },
  { label: 'Podcasts', href: '/#archive' },
  { label: 'Terminal', href: '/terminal' },
  { label: 'Admin', href: '/admin' },
]

export default function TopNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname.startsWith('/admin')) return null

  return (
    <header className={`summit-nav ${scrolled ? 'summit-nav--scrolled' : ''}`}>
      <Link href="/" className="summit-brand" aria-label="Aaron Walters home">
        <span className="summit-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          <strong>Aaron Walters</strong>
          <small>Technology dashboard</small>
        </span>
      </Link>

      <nav className="summit-links" aria-label="Primary navigation">
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} href={href}>{label}</Link>
        ))}
      </nav>

      <a className="summit-status" href="/#news">
        <span />
        Live signal
      </a>
    </header>
  )
}
