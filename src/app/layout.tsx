import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/context/PlayerContext'
import AudioPlayerBar from '@/components/AudioPlayerBar'
import TopNav from '@/components/TopNav'
import ShaderBackground from '@/components/ShaderBackground'

export const metadata: Metadata = {
  title: 'PODCAST//TERM — AI Tech Terminal',
  description: 'AI/tech news terminal with curated podcast episode archive.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlayerProvider>
          <ShaderBackground />
          <TopNav />
          <div className="min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
          <AudioPlayerBar />
        </PlayerProvider>
      </body>
    </html>
  )
}
