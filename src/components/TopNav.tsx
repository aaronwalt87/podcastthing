'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'TERMINAL', href: '/' },
  { label: 'EPISODES', href: '/?all=1' },
  { label: 'INTEL', href: '#intel' },
  { label: 'ADMIN', href: '/admin' },
]

export default function TopNav() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return null

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-between px-4 sm:px-6"
      style={{ background: '#0e0e0e', borderBottom: '1px solid #353534' }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center flex-shrink-0">
        <span
          className="text-sm font-bold tracking-widest uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e5e2e1' }}
        >
          {'PODCAST'}
        </span>
        <span
          className="text-sm font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#FF3B3B' }}
        >
          {'//'}
        </span>
        <span
          className="text-sm font-bold tracking-widest uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e5e2e1' }}
        >
          {'TERM'}
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden sm:flex items-center gap-6">
        {NAV_LINKS.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
          return (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs tracking-widest uppercase transition-colors duration-150"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: isActive ? '#e5e2e1' : '#67d7e1',
                borderBottom: isActive ? '1px solid #FF3B3B' : '1px solid transparent',
                paddingBottom: '2px',
              }}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="blink text-xs" style={{ color: '#FF3B3B' }}>▮</span>
        <span
          className="text-xs tracking-widest uppercase hidden sm:block"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1', opacity: 0.6 }}
        >
          SYS:ONLINE
        </span>
      </div>
    </nav>
  )
}
