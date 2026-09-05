'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-5 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-hair pb-6">
        <div>
          <p className="eyebrow eyebrow-accent">Episode archive</p>
          <h1 className="display mt-2 text-4xl">Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn btn-sm">
            View site
          </Link>
          <button type="button" onClick={handleLogout} className="btn btn-ghost btn-sm">
            Log out
          </button>
        </div>
      </header>

      <section aria-label="Add an episode">
        {showForm ? (
          <div className="panel p-6">
            <div className="mb-5 flex items-center justify-between">
              <p className="eyebrow eyebrow-accent">New episode</p>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost btn-sm"
              >
                Close
              </button>
            </div>
            <EpisodeForm
              onSuccess={handleAdded}
              onCancel={() => setShowForm(false)}
              categories={categories}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn w-full border-dashed"
            style={{ height: 52 }}
          >
            <span aria-hidden="true">+</span> Add an episode
          </button>
        )}
      </section>

      <section aria-label="Episodes">
        <div className="mb-5 flex items-center justify-between">
          <p className="eyebrow">
            {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
          </p>
          <button type="button" onClick={fetchEpisodes} className="btn btn-ghost btn-sm">
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="panel-flat px-6 py-12 text-center text-sm text-paper-3">Loading episodes…</p>
        ) : error ? (
          <p
            role="alert"
            className="alert"
          >
            {error}{' '}
            <button type="button" onClick={fetchEpisodes} className="link-draw ml-1">
              Retry
            </button>
          </p>
        ) : (
          <EpisodeList
            episodes={episodes}
            onUpdate={handleUpdated}
            onDelete={handleDeleted}
            categories={categories}
          />
        )}
      </section>
    </div>
  )
}
