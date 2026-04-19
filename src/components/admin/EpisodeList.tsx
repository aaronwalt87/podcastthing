'use client'

import { useState } from 'react'
import type { Episode } from '@/types/episode'
import EpisodeForm from './EpisodeForm'

interface EpisodeListProps {
  episodes: Episode[]
  onUpdate: (episode: Episode) => void
  onDelete: (id: string) => void
  categories?: string[]
}

export default function EpisodeList({ episodes, onUpdate, onDelete, categories = [] }: EpisodeListProps) {
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
      <p
        className="text-sm text-center py-8 uppercase tracking-wider"
        style={{ color: '#e5e2e1', opacity: 0.35, fontFamily: "'Space Grotesk', sans-serif" }}
      >
        No episodes yet. Add one above.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {episodes.map((episode) => (
        <div key={episode.id} style={{ background: '#1c1b1b' }}>
          {editingId === episode.id ? (
            <div className="p-4">
              <p
                className="text-xs uppercase tracking-wider mb-4"
                style={{ color: '#67d7e1', fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Editing episode
              </p>
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
            <div className="flex items-center gap-3 p-3">
              {/* Thumbnail */}
              {episode.thumbnailUrl ? (
                <img
                  src={episode.thumbnailUrl}
                  alt={episode.title}
                  className="w-12 h-12 object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-12 h-12 flex-shrink-0 flex items-center justify-center"
                  style={{ background: '#131313' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                      fill="#353534"
                    />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#e5e2e1' }}>
                  {episode.title}
                </p>
                <p
                  className="text-xs truncate uppercase tracking-wider"
                  style={{ color: '#67d7e1', fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {episode.showName}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="text-xs px-1.5 py-0.5 uppercase tracking-wider"
                    style={{
                      background: '#353534',
                      borderLeft: `1px solid ${episode.audioType === 'upload' ? '#67d7e1' : 'rgba(93,63,60,0.5)'}`,
                      color: episode.audioType === 'upload' ? '#67d7e1' : '#e5e2e1',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {episode.audioType === 'upload' ? 'Blob' : 'URL'}
                  </span>
                  {episode.category && (
                    <span
                      className="text-xs px-1.5 py-0.5 uppercase tracking-wider"
                      style={{
                        background: '#353534',
                        borderLeft: '1px solid #67d7e1',
                        color: '#67d7e1',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {episode.category}
                    </span>
                  )}
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ color: '#e5e2e1', opacity: 0.3, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {new Date(episode.addedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setEditingId(episode.id)}
                  className="text-xs px-2.5 py-1.5 uppercase tracking-wider transition-colors"
                  style={{
                    background: '#353534',
                    color: '#e5e2e1',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(episode.id)}
                  disabled={deletingId === episode.id}
                  className="text-xs px-2.5 py-1.5 uppercase tracking-wider transition-colors disabled:opacity-50"
                  style={{
                    background: '#353534',
                    color: '#FF3B3B',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
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
