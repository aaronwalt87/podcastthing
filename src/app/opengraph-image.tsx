import { ImageResponse } from 'next/og'
import { profile } from '@/lib/profile'

export const runtime = 'edge'
export const alt = `${profile.name} — ${profile.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Social card. Generated at request time rather than shipped as a binary, so it
 * always reflects whatever is in profile.ts.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#07080a',
          backgroundImage:
            'radial-gradient(900px 500px at 8% -10%, rgba(255,106,43,0.20), transparent 62%)',
          padding: '72px 80px',
          color: '#f2f0ec',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="52" height="40" viewBox="0 0 26 20" fill="none">
            <path
              d="M1 19L7 8l5 6 4-9 8 14"
              stroke="#ff6a2b"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#9aa4ae',
            }}
          >
            {profile.name} · {profile.location}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.04, letterSpacing: -2 }}>
            {profile.tagline}
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: '#9aa4ae' }}>
            Live tech news · markets · listening archive
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            fontSize: 20,
            color: '#7f8895',
          }}
        >
          <div style={{ display: 'flex', width: 60, height: 3, background: '#ff6a2b' }} />
          Built and refreshed on a schedule
        </div>
      </div>
    ),
    size
  )
}
