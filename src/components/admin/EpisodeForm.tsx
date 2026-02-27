'use client'

import { useState } from 'react'
import { upload } from '@vercel/blob/client'
import type { Episode } from '@/types/episode'

interface EpisodeFormProps {
  episode?: Episode
  onSuccess: (episode: Episode) => void
  onCancel?: () => void
}

const emptyForm = {
  title: '',
  showName: '',
  description: '',
  audioUrl: '',
  thumbnailUrl: '',
  audioType: 'url' as 'upload' | 'url',
}

export default function EpisodeForm({ episode, onSuccess, onCancel }: EpisodeFormProps) {
  const isEditing = Boolean(episode)

  const [form, setForm] = useState({
    title: episode?.title ?? '',
    showName: episode?.showName ?? '',
    description: episode?.description ?? '',
    audioUrl: episode?.audioUrl ?? '',
    thumbnailUrl: episode?.thumbnailUrl ?? '',
    audioType: episode?.audioType ?? 'url' as 'upload' | 'url',
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.title.trim() || !form.showName.trim()) {
      setError('Title and show name are required.')
      return
    }

    if (form.audioType === 'url' && !form.audioUrl.trim()) {
      setError('Audio URL is required.')
      return
    }

    if (form.audioType === 'upload' && !file && !isEditing) {
      setError('Please select an audio file to upload.')
      return
    }

    try {
      let audioUrl = form.audioUrl

      // Step 1: Upload file directly to Vercel Blob CDN from the browser
      if (form.audioType === 'upload' && file) {
        setUploading(true)
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/upload',
          multipart: true,
        })
        audioUrl = blob.url
        setUploading(false)
      }

      // Step 2: Save episode metadata to Redis
      setSaving(true)
      const url = isEditing ? `/api/episodes/${episode!.id}` : '/api/episodes'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          showName: form.showName.trim(),
          description: form.description.trim(),
          audioUrl,
          audioType: form.audioType,
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save episode')
      }

      const saved: Episode = await res.json()
      setSaving(false)
      onSuccess(saved)
    } catch (err) {
      setUploading(false)
      setSaving(false)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  const isLoading = uploading || saving

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Audio source toggle */}
      {!isEditing && (
        <div className="flex rounded-lg overflow-hidden border border-neutral-700">
          {(['url', 'upload'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                update('audioType', type)
                setFile(null)
                update('audioUrl', '')
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                form.audioType === type
                  ? 'bg-white text-neutral-950'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              {type === 'url' ? 'Paste URL' : 'Upload File'}
            </button>
          ))}
        </div>
      )}

      {/* Audio source input */}
      {form.audioType === 'url' ? (
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Audio URL</label>
          <input
            type="url"
            value={form.audioUrl}
            onChange={(e) => update('audioUrl', e.target.value)}
            placeholder="https://example.com/episode.mp3"
            className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-400"
            required={!isEditing}
          />
          <p className="text-xs text-neutral-600 mt-1">
            Note: Some podcast CDNs block cross-origin requests — if playback fails, download and
            re-upload the file instead.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Audio File</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-neutral-700 file:text-white hover:file:bg-neutral-600 cursor-pointer"
          />
          <p className="text-xs text-neutral-600 mt-1">Max 200 MB. MP3, M4A, OGG, WAV, AAC, FLAC.</p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs text-neutral-400 mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Episode title"
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-400"
          required
        />
      </div>

      {/* Show Name */}
      <div>
        <label className="block text-xs text-neutral-400 mb-1">Show Name</label>
        <input
          type="text"
          value={form.showName}
          onChange={(e) => update('showName', e.target.value)}
          placeholder="Podcast show name"
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-400"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-neutral-400 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Short description (optional)"
          rows={3}
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-400 resize-none"
        />
      </div>

      {/* Thumbnail URL */}
      <div>
        <label className="block text-xs text-neutral-400 mb-1">Thumbnail URL (optional)</label>
        <input
          type="url"
          value={form.thumbnailUrl}
          onChange={(e) => update('thumbnailUrl', e.target.value)}
          placeholder="https://example.com/cover.jpg"
          className="w-full bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded bg-red-950 border border-red-800 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-white text-neutral-950 text-sm font-medium rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading…' : saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Episode'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="py-2 px-4 bg-neutral-800 text-neutral-300 text-sm rounded hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
