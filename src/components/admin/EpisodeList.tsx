'use client'

import { useState } from 'react'
import EpisodeForm from './EpisodeForm'
import EpisodeArtwork from '@/components/podcasts/EpisodeArtwork'
import { longDate } from '@/lib/format'
import type { Episode } from '@/types/episode'

interface EpisodeListProps {
  episodes: Episode[]
  onUpdate: (episode: Episode) => void
  onDelete: (id: string) => void
  categories?: string[]
}

export default function EpisodeList({
  episodes,
  onUpdate,
  onDelete,
  categories = [],
}: EpisodeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (episode: Episode) => {
    if (!confirm(`Delete “${episode.title}”? This cannot be undone.`)) return

    setDeletingId(episode.id)
    setError(null)
    try {
      const res = await fetch(`/api/episodes/${episode.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      onDelete(episode.id)
    } catch {
      setError(`Could not delete “${episode.title}”. Please try again.`)
    } finally {
      setDeletingId(null)
    }
  }

  if (episodes.length === 0) {
    return (
      <p className="panel-flat px-6 py-12 text-center text-sm text-paper-3">
        No episodes yet. Add one above.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p
          role="alert"
          className="alert"
        >
          {error}
        </p>
      )}

      {episodes.map((episode) => (
        <div key={episode.id} className="panel-flat overflow-hidden">
          {editingId === episode.id ? (
            <div className="p-5">
              <p className="eyebrow eyebrow-accent mb-4">Editing episode</p>
              <EpisodeForm
                episode={episode}
                onSuccess={(updated) => {
                  onUpdate(updated)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
                categories={categories}
              />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-ink-800">
                <EpisodeArtwork episode={episode} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-paper">{episode.title}</p>
                <p className="num truncate text-[10px] uppercase tracking-wider text-ember">
                  {episode.showName}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="chip">{episode.audioType === 'upload' ? 'Blob' : 'URL'}</span>
                  {episode.category && <span className="chip chip-accent">{episode.category}</span>}
                  <span className="num text-[10px] text-paper-3">{longDate(episode.addedAt)}</span>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(episode.id)}
                  className="btn btn-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(episode)}
                  disabled={deletingId === episode.id}
                  className="btn btn-sm disabled:opacity-50"
                  style={{ color: 'var(--neg)', borderColor: 'rgba(240,90,82,0.3)' }}
                >
                  {deletingId === episode.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
