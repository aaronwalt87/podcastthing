import { ImageResponse } from 'next/og'
import { profile } from '@/lib/profile'

export const runtime = 'edge'
export const alt = `${profile.name} — ${profile.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// The image renderer has no document/CSS context. Mirror the canonical tokens
// here; all in-browser components reference globals.css directly.
const palette = { cream: '#f2f1e9', charcoal: '#252820', olive: '#4b593c', orange: '#ad3e20' }

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: palette.cream, color: palette.charcoal, fontFamily: 'sans-serif', position: 'relative', padding: '54px 64px', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
            <svg width="52" height="38" viewBox="0 0 44 32" fill="none">
              <path d="M3 27L13 5L23 27L31 8L37 27L42 5M7 19H19" stroke={palette.charcoal} strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="bevel" />
            </svg>
            <span style={{ fontSize: 23, fontWeight: 700, letterSpacing: -1 }}>{profile.name}</span>
          </div>
          <div style={{ display: 'flex', border: `1px solid ${palette.olive}`, borderRadius: 40, padding: '12px 22px', fontSize: 16 }}>A personal technology dashboard</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 90, fontWeight: 700, letterSpacing: -6, lineHeight: 1.02, zIndex: 1 }}>
          <span>{profile.heroLead}</span>
          <span style={{ color: palette.olive }}>{profile.heroLeadMuted}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${palette.olive}`, paddingTop: 24 }}>
          <span style={{ fontSize: 18 }}>Tech signals. Market context. Episodes worth finishing.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16 }}>
            <span style={{ width: 10, height: 10, background: palette.orange, borderRadius: 10 }} />
            Built in {profile.location}
          </div>
        </div>
      </div>
    ),
    size
  )
}
