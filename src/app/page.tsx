import Image from 'next/image'
import { getAllEpisodes, getAllCategories } from '@/lib/episodes'
import EpisodeGrid from '@/components/EpisodeGrid'
import CategoryTabs from '@/components/CategoryTabs'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  searchParams: { category?: string }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [allEpisodes, categories] = await Promise.all([
    getAllEpisodes(),
    getAllCategories(),
  ])

  const selectedCategory = searchParams.category
  const episodes = selectedCategory
    ? allEpisodes.filter((ep) => ep.category === selectedCategory)
    : allEpisodes

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-10">
      {/* Header */}
      <header className="mb-10">
        {/* Top status bar */}
        <div className="flex items-center justify-between mb-4 text-xs pb-2 border-b border-amber-900/30"
             style={{ color: '#a07850' }}>
          <span style={{ color: '#7a5a38' }}>SYS:ONLINE <span className="blink" style={{ color: '#e83020' }}>▮</span></span>
          <span style={{ color: '#cc4020' }}>[ BROADCAST READY ]</span>
          <span style={{ color: '#7a5a38' }}>VER 2.0</span>
        </div>

        <div className="flex items-center gap-5 mb-3">
          {/* Logo with warm frame */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 rounded-sm opacity-30"
                 style={{ background: 'radial-gradient(circle, rgba(200,80,30,0.5) 0%, transparent 70%)' }} />
            <div className="relative rounded-sm p-0.5"
                 style={{ border: '1px solid rgba(160,80,40,0.5)', boxShadow: '0 0 12px rgba(180,70,30,0.25), inset 0 0 8px rgba(160,60,20,0.05)' }}>
              <Image
                src="/logo.svg"
                alt="Podcast Showcase"
                width={96}
                height={96}
                className="relative block"
                priority
              />
            </div>
          </div>

          <div>
            <div className="text-xs tracking-widest mb-1 font-mono" style={{ color: '#7a5038' }}>
              {'// SYSTEM AUDIO ARCHIVE'}
            </div>
            <h1
              className="text-4xl font-black tracking-wider font-mono"
              style={{
                fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                color: '#e8d8c0',
                textShadow: '0 0 12px rgba(196,144,80,0.7), 0 0 30px rgba(160,100,50,0.35)',
                letterSpacing: '0.08em',
              }}
            >
              PODCAST<span style={{ color: '#e83020', textShadow: '0 0 12px rgba(232,48,32,0.9)' }}>_</span>SHOWCASE
            </h1>
            <p className="text-sm mt-1 tracking-widest" style={{ color: '#a07850' }}>
              ◆ CURATED EPISODE ARCHIVE ◆
            </p>
          </div>
        </div>

        {/* Divider with corner marks */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs" style={{ color: '#e83020' }}>◀</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, rgba(232,48,32,0.6), rgba(160,100,50,0.3), transparent)' }} />
          <span className="text-xs tracking-widest" style={{ color: '#a07850' }}>AUDIO DB v2.0</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, rgba(232,48,32,0.6), rgba(160,100,50,0.3), transparent)' }} />
          <span className="text-xs" style={{ color: '#e83020' }}>▶</span>
        </div>
      </header>

      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="mb-8">
          <CategoryTabs categories={categories} selected={selectedCategory} />
        </div>
      )}

      {/* Episode grid */}
      <EpisodeGrid episodes={episodes} selectedCategory={selectedCategory} />
    </main>
  )
}
