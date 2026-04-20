'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV_ITEMS = [
  {
    label: 'Terminal',
    href: '/terminal',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M4 6l2.5 2L4 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Episodes',
    href: '/',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname.startsWith('/admin')) return null

  return (
    <aside
      className="glass-dark fixed top-12 left-0 bottom-8 z-40 hidden lg:flex flex-col"
      style={{ width: '240px', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-bold tracking-widest uppercase text-white">COMMAND_CENTER</p>
        <p className="font-mono text-xs mt-0.5" style={{ color: '#b9ccb2' }}>v2.0.4-stable</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-2 flex-1">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-all duration-150"
              style={{
                color: active ? '#00FF41' : '#b9ccb2',
                background: active ? 'rgba(0,255,65,0.07)' : 'transparent',
                borderLeft: active ? '2px solid #00FF41' : '2px solid transparent',
                textShadow: active ? '0 0 8px rgba(0,255,65,0.4)' : undefined,
              }}
            >
              {icon}
              <span className="font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* CTA */}
      <div className="px-3 pb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        <button
          onClick={() => router.push('/admin')}
          className="w-full py-2.5 text-xs font-bold tracking-widest uppercase rounded transition-all duration-150"
          style={{
            background: '#00FF41',
            color: '#131313',
            boxShadow: '0 0 12px rgba(0,255,65,0.3)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,255,65,0.55)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,255,65,0.3)' }}
        >
          INITIATE_SESSION
        </button>
      </div>

      {/* Footer links */}
      <div className="px-2 pb-3 flex flex-col gap-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
        {[{ label: 'Settings', href: '/admin' }, { label: 'Logs', href: '/' }].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 px-3 py-2 text-xs rounded transition-colors duration-150"
            style={{ color: 'rgba(185,204,178,0.6)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#b9ccb2' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(185,204,178,0.6)' }}
          >
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
