import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/context/PlayerContext'
import AudioPlayerBar from '@/components/AudioPlayerBar'

export const metadata: Metadata = {
  title: 'Podcast Showcase',
  description: 'A curated collection of favorite podcast episodes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ color: '#2a1e10' }}>
        <PlayerProvider>
          {/* pb-28 to clear the fixed bottom player bar */}
          <div className="min-h-screen pb-28">
            {children}
          </div>
          <AudioPlayerBar />
        </PlayerProvider>
      </body>
    </html>
  )
}
