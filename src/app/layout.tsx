import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/context/PlayerContext'
import AudioPlayerBar from '@/components/AudioPlayerBar'
import TopNav from '@/components/TopNav'

export const metadata: Metadata = {
  title: 'Aaron Walters — Technology Dashboard',
  description: 'Live technology news, podcast archive, and systems notes from Aaron Walters.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlayerProvider>
          <TopNav />
          {children}
          <AudioPlayerBar />
        </PlayerProvider>
      </body>
    </html>
  )
}
