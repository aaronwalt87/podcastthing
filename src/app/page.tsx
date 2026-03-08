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
        <div className="flex items-center justify-between mb-4 text-xs text-blue-600 border-b border-blue-900/40 pb-2">
          <span>SYS:ONLINE <span className="blink">▮</span></span>
          <span className="text-amber-500/70">[ BROADCAST READY ]</span>
          <span>VER 2.0</span>
        </div>

        <div className="flex items-center gap-5 mb-3">
          {/* Logo with neon frame */}
          <div className="relative flex-shrink-0">
            <div className="absolute -inset-1 rounded-sm bg-blue-500/20 blur-md" />
            <div className="relative border border-blue-500/40 rounded-sm p-0.5" style={{ boxShadow: '0 0 12px rgba(59,130,246,0.3), inset 0 0 8px rgba(59,130,246,0.05)' }}>
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
            {/* Retro label */}
            <div className="text-xs text-blue-600 tracking-widest mb-1 font-mono">// SYSTEM AUDIO ARCHIVE</div>
            <h1
              className="text-4xl font-black tracking-wider text-blue-100 font-mono"
              style={{
                fontFamily: "'Orbitron', 'Share Tech Mono', monospace",
                textShadow: '0 0 12px rgba(96,165,250,0.8), 0 0 30px rgba(59,130,246,0.4)',
                letterSpacing: '0.08em',
              }}
            >
              PODCAST<span className="text-amber-400" style={{ textShadow: '0 0 12px rgba(251,191,36,0.8)' }}>_</span>SHOWCASE
            </h1>
            <p className="text-blue-500 text-sm mt-1 tracking-widest">
              ◆ CURATED EPISODE ARCHIVE ◆
            </p>
          </div>
        </div>

        {/* Neon divider with corner marks */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-amber-500 text-xs">◀</span>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-500/60 via-blue-500/40 to-transparent" />
          <span className="text-blue-500 text-xs tracking-widest">AUDIO DB v2.0</span>
          <div className="flex-1 h-px bg-gradient-to-l from-amber-500/60 via-blue-500/40 to-transparent" />
          <span className="text-amber-500 text-xs">▶</span>
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
