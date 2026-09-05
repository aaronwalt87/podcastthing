import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { PlayerProvider } from '@/context/PlayerContext'
import SiteHeader from '@/components/nav/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import CommandPalette from '@/components/nav/CommandPalette'
import PlayerBar from '@/components/player/PlayerBar'

/* Self-hosted at build time: no third-party request, no layout shift. */
const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
})

const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-instrument-serif',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://aaronwalters.dev'),
  title: {
    default: 'Aaron Walters — Signal',
    template: '%s · Aaron Walters',
  },
  description:
    'Technology news, market signal, and a curated podcast archive — collected in one dashboard and refreshed on a schedule.',
  openGraph: {
    type: 'website',
    siteName: 'Aaron Walters — Signal',
    title: 'Aaron Walters — Signal',
    description:
      'Technology news, market signal, and a curated podcast archive, in one place.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#07080a',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <PlayerProvider>
          <a href="#main" className="sr-only-focusable">
            Skip to content
          </a>

          <SiteHeader />
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
