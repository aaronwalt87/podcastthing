import type { Metadata } from 'next'
import './globals.css'
import { PlayerProvider } from '@/context/PlayerContext'
import AudioPlayerBar from '@/components/AudioPlayerBar'
import ShaderBackground from '@/components/ShaderBackground'
import TopNav from '@/components/TopNav'
import Sidebar from '@/components/Sidebar'
import StatusBar from '@/components/StatusBar'

export const metadata: Metadata = {
  title: 'PODCAST//TERM — AI Tech Terminal',
  description: 'AI/tech news terminal with curated podcast episode archive.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PlayerProvider>
          <ShaderBackground />
          {/* Fixed shell */}
          <TopNav />
          <Sidebar />
          <StatusBar />
          <AudioPlayerBar />
          {/* Scrollable content — offset for sidebar on desktop */}
          <div className="min-h-screen pt-12 lg:ml-60" style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </PlayerProvider>
      </body>
    </html>
  )
}
