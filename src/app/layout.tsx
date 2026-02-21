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
      <body className="bg-neutral-950 text-white antialiased">
        <PlayerProvider>
          {/* pb-24 to clear the fixed bottom player bar */}
          <div className="min-h-screen pb-24">
            {children}
          </div>
          <AudioPlayerBar />
        </PlayerProvider>
      </body>
    </html>
  )
}
