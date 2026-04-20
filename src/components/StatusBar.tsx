'use client'

import { usePathname } from 'next/navigation'

export default function StatusBar() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin')) return null

  return (
    <footer
      className="glass-dark fixed bottom-0 left-0 right-0 z-40 h-8 flex items-center justify-between px-4 sm:px-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Left — copyright */}
      <span className="font-mono text-xs hidden sm:block" style={{ color: 'rgba(185,204,178,0.5)', fontSize: '10px' }}>
        © 2026 AARON_J_WALTERS {'// ALL_RIGHTS_RESERVED'}
      </span>

      {/* Center — system stats */}
      <div className="flex items-center gap-4 font-mono" style={{ fontSize: '10px' }}>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00FF41', boxShadow: '0 0 4px rgba(0,255,65,0.8)' }} />
          <span style={{ color: '#b9ccb2' }}>STATUS: ONLINE</span>
        </span>
        <span style={{ color: 'rgba(185,204,178,0.4)' }}>LATENCY: 14MS</span>
        <span style={{ color: 'rgba(185,204,178,0.4)' }}>MEMORY: 42%</span>
      </div>

      {/* Right — links */}
      <div className="hidden sm:flex items-center gap-3 font-mono" style={{ fontSize: '10px', color: 'rgba(185,204,178,0.4)' }}>
        {['GITHUB', 'TWITTER', 'LINKEDIN'].map((link) => (
          <span
            key={link}
            className="cursor-pointer transition-colors duration-150"
            style={{ color: 'rgba(185,204,178,0.4)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.color = '#00FF41' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.color = 'rgba(185,204,178,0.4)' }}
          >
            {link}
          </span>
        ))}
      </div>
    </footer>
  )
}
