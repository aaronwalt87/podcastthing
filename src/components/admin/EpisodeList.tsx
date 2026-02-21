'use client'

import { useState } from 'react'
import type { Episode } from '@/types/episode'
import EpisodeForm from './EpisodeForm'

interface EpisodeListProps {
  episodes: Episode[]
  onUpdate: (episode: Episode) => void
  onDelete: (id: string) => void
}

export default function EpisodeList({ episodes, onUpdate, onDelete }: EpisodeListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this episode? This cannot be undone.')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/episodes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      onDelete(id)
    } catch {
      alert('Failed to delete episode. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (episodes.length === 0) {
    return (
      <p className="text-neutral-500 text-sm text-center py-8">
        No episodes yet. Add one above.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden"
        >
          {editingId === episode.id ? (
            <div className="p-4">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Editing episode</p>
              <EpisodeForm
                episode={episode}
                onSuccess={(updated) => {
                  onUpdate(updated)
                  setEditingId(null)
                }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3">
              {/* Thumbnail */}
              {episode.thumbnailUrl ? (
                <img
                  src={episode.thumbnailUrl}
                  alt={episode.title}
                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-neutral-800 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{episode.title}</p>
                <p className="text-neutral-500 text-xs truncate">{episode.showName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    episode.audioType === 'upload'
                      ? 'bg-blue-950 text-blue-400'
                      : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    {episode.audioType === 'upload' ? 'Blob' : 'URL'}
                  </span>
                  <span className="text-neutral-600 text-xs">
                    {new Date(episode.addedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditingId(episode.id)}
                  className="text-xs px-2.5 py-1.5 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(episode.id)}
                  disabled={deletingId === episode.id}
                  className="text-xs px-2.5 py-1.5 bg-neutral-800 text-red-400 rounded hover:bg-red-950 hover:text-red-300 disabled:opacity-50 transition-colors"
                >
                  {deletingId === episode.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
