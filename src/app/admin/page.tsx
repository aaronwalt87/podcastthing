'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import EpisodeForm from '@/components/admin/EpisodeForm'
import EpisodeList from '@/components/admin/EpisodeList'
import type { Episode } from '@/types/episode'

export default function AdminPage() {
  const router = useRouter()
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  useEffect(() => {
    fetchEpisodes()
  }, [])

  const fetchEpisodes = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/episodes')
      if (!res.ok) throw new Error('Failed to load episodes')
      const data: Episode[] = await res.json()
      setEpisodes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load episodes')
    } finally {
      setLoading(false)
    }
  }

  const categories = Array.from(new Set(episodes.map((ep) => ep.category).filter(Boolean) as string[])).sort()

  const handleAdded = (episode: Episode) => {
    setEpisodes((prev) => [episode, ...prev])
    setShowForm(false)
  }

  const handleUpdated = (updated: Episode) => {
    setEpisodes((prev) => prev.map((ep) => (ep.id === updated.id ? updated : ep)))
  }

  const handleDeleted = (id: string) => {
    setEpisodes((prev) => prev.filter((ep) => ep.id !== id))
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={48} height={48} />
          <div>
            <h1
              className="text-xl font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e5e2e1' }}
            >
              ADMIN
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#e5e2e1', opacity: 0.45 }}>
              Manage your podcast episodes.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-sm uppercase tracking-wider transition-colors hover:opacity-100"
            style={{ color: '#67d7e1', fontFamily: "'Space Grotesk', sans-serif", opacity: 0.8 }}
          >
            ← View site
          </a>
          <button
            onClick={handleLogout}
            className="text-sm uppercase tracking-wider transition-colors"
            style={{ color: '#e5e2e1', opacity: 0.4, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Add episode section */}
      <section className="mb-10">
        {showForm ? (
          <div className="p-5" style={{ background: '#1c1b1b' }}>
            <h2
              className="text-xs font-medium uppercase tracking-wider mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1' }}
            >
              New Episode
            </h2>
            <EpisodeForm
              onSuccess={handleAdded}
              onCancel={() => setShowForm(false)}
              categories={categories}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 text-sm uppercase tracking-wider transition-all"
            style={{
              background: 'transparent',
              border: '1px solid rgba(93,63,60,0.35)',
              color: '#e5e2e1',
              opacity: 0.6,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget
              btn.style.opacity = '1'
              btn.style.borderColor = 'rgba(255,59,59,0.5)'
              btn.style.color = '#FF3B3B'
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget
              btn.style.opacity = '0.6'
              btn.style.borderColor = 'rgba(93,63,60,0.35)'
              btn.style.color = '#e5e2e1'
            }}
          >
            + ADD EPISODE
          </button>
        )}
      </section>

      {/* Episode list */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xs font-medium uppercase tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#67d7e1' }}
          >
            Episodes ({episodes.length})
          </h2>
          <button
            onClick={fetchEpisodes}
            className="text-xs uppercase tracking-wider transition-colors"
            style={{ color: '#e5e2e1', opacity: 0.35, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="w-5 h-5 border-2 animate-spin"
              style={{ borderColor: '#353534', borderTopColor: '#FF3B3B' }}
            />
          </div>
        ) : error ? (
          <div
            className="px-4 py-3 text-sm"
            style={{ background: 'rgba(255,59,59,0.08)', borderLeft: '2px solid #FF3B3B', color: '#ffb3ac' }}
          >
            {error}{' '}
            <button
              onClick={fetchEpisodes}
              className="underline hover:no-underline ml-1"
              style={{ color: '#FF3B3B' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <EpisodeList
            episodes={episodes}
            onUpdate={handleUpdated}
            onDelete={handleDeleted}
            categories={categories}
          />
        )}
      </section>
    </main>
  )
}
