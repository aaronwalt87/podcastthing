import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { PlayerProvider } from '@/context/PlayerContext'
import SiteHeader from '@/components/nav/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import CommandPalette from '@/components/nav/CommandPalette'
import PlayerBar from '@/components/player/PlayerBar'
import DevDataBanner from '@/components/DevDataBanner'
import { profile } from '@/lib/profile'

/* Self-hosted at build time: no third-party request, no layout shift. */
const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aaronwalters.dev'

const DESCRIPTION =
  `Technology news, market updates, and a curated podcast archive. Collected by ${profile.name}.`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — ${profile.tagline}`,
    template: `%s · ${profile.name}`,
  },
  description: DESCRIPTION,
  authors: [{ name: profile.name, url: `${SITE_URL}/about` }],
  creator: profile.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    locale: 'en_US',
    siteName: profile.name,
    title: `${profile.name} — ${profile.tagline}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${profile.name} — ${profile.tagline}`,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  // Must be a literal — Next serialises this into a meta tag, so it cannot
  // reference the --ink-950 custom property it mirrors.
  themeColor: '#f2f1e9',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <PlayerProvider>
          <a href="#main" className="sr-only-focusable">
            Skip to content
          </a>

          <SiteHeader />
          <DevDataBanner />
          <CommandPalette />

          <main id="main" tabIndex={-1}>
            {children}
          </main>

          <SiteFooter />
          <PlayerBar />
        </PlayerProvider>
      </body>
    </html>
  )
}
