'use client'

import { useState, useEffect } from 'react'
import EpisodeForm from '@/components/admin/EpisodeForm'
import EpisodeList from '@/components/admin/EpisodeList'
import type { Episode } from '@/types/episode'

export default function AdminPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Admin</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Manage your podcast episodes.</p>
        </div>
        <a
          href="/"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← View site
        </a>
      </div>

      {/* Add episode section */}
      <section className="mb-10">
        {showForm ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-white mb-4 uppercase tracking-wider">
              New Episode
            </h2>
            <EpisodeForm
              onSuccess={handleAdded}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border border-dashed border-neutral-700 rounded-lg text-sm text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
          >
            + Add Episode
          </button>
        )}
      </section>

      {/* Episode list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
            Episodes ({episodes.length})
          </h2>
          <button
            onClick={fetchEpisodes}
            className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
            {error}{' '}
            <button onClick={fetchEpisodes} className="underline hover:no-underline ml-1">
              Retry
            </button>
          </div>
        ) : (
          <EpisodeList
            episodes={episodes}
            onUpdate={handleUpdated}
            onDelete={handleDeleted}
          />
        )}
      </section>
    </main>
  )
}
