'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'

const NAV_LINKS = [
  { label: 'TERMINAL', href: '/terminal' },
  { label: 'EPISODES', href: '/' },
  { label: 'ADMIN',    href: '/admin' },
]

export default function TopNav() {
  const pathname = usePathname()
  const [lightMode, setLightMode] = useState(false)

  const toggleLight = useCallback(() => {
    const next = !lightMode
    setLightMode(next)
    document.body.classList.toggle('light-mode', next)
  }, [lightMode])

  if (pathname.startsWith('/admin')) return null

  return (
    <header
      className="glass-dark fixed top-0 left-0 right-0 z-40 h-12 flex items-center justify-between px-4 sm:px-6"
    >
      {/* Left — username + status dots */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff5f57' }} />
        <span
          className="text-xs font-bold tracking-widest uppercase hidden sm:block"
          style={{ color: 'var(--text-primary)' }}
        >
          AARON_J_WALTERS
        </span>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#fdbb2c' }} />
      </div>

      {/* Center nav */}
      <nav className="hidden sm:flex items-center gap-6">
        {NAV_LINKS.map(({ label, href }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={label}
              href={href}
              className="text-xs font-bold tracking-widest uppercase transition-all duration-150"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: active ? '#00FF41' : '#b9ccb2',
                textShadow: active ? '0 0 8px rgba(0,255,65,0.6)' : undefined,
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right — light mode toggle + status dot */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLight}
          aria-label="Toggle light mode"
          className="transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"
               style={{ color: lightMode ? '#fdbb2c' : '#b9ccb2' }}
               onMouseEnter={(e) => { (e.currentTarget as SVGElement).style.color = lightMode ? '#fdbb2c' : '#00FF41' }}
               onMouseLeave={(e) => { (e.currentTarget as SVGElement).style.color = lightMode ? '#fdbb2c' : '#b9ccb2' }}>
            <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FF41', boxShadow: '0 0 6px rgba(0,255,65,0.8)' }} />
      </div>
    </header>
  )
}
