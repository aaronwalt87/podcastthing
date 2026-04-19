'use client'

import { useState } from 'react'
import { upload } from '@vercel/blob/client'
import type { Episode } from '@/types/episode'

interface EpisodeFormProps {
  episode?: Episode
  onSuccess: (episode: Episode) => void
  onCancel?: () => void
  categories?: string[]
}

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  borderBottom: '1px solid rgba(93,63,60,0.5)',
  color: '#e5e2e1',
  outline: 'none',
  width: '100%',
  padding: '8px 0',
  fontSize: '0.875rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#67d7e1',
  marginBottom: '4px',
  fontFamily: "'Space Grotesk', sans-serif",
}

function onFocusGlow(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderBottomColor = '#FF3B3B'
  e.target.style.boxShadow = '0 4px 0 rgba(255,59,59,0.12)'
}

function onBlurGlow(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderBottomColor = 'rgba(93,63,60,0.5)'
  e.target.style.boxShadow = 'none'
}

export default function EpisodeForm({ episode, onSuccess, onCancel, categories = [] }: EpisodeFormProps) {
  const isEditing = Boolean(episode)

  const [form, setForm] = useState({
    title: episode?.title ?? '',
    showName: episode?.showName ?? '',
    description: episode?.description ?? '',
    audioUrl: episode?.audioUrl ?? '',
    thumbnailUrl: episode?.thumbnailUrl ?? '',
    category: episode?.category ?? '',
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
          category: form.category.trim() || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Audio source toggle */}
      {!isEditing && (
        <div className="flex overflow-hidden" style={{ borderBottom: '1px solid rgba(93,63,60,0.5)' }}>
          {(['url', 'upload'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                update('audioType', type)
                setFile(null)
                update('audioUrl', '')
              }}
              className="flex-1 py-2 text-xs font-medium uppercase tracking-wider transition-colors"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                background: form.audioType === type ? '#FF3B3B' : 'transparent',
                color: form.audioType === type ? '#410003' : '#e5e2e1',
                boxShadow: form.audioType === type ? '0 0 8px rgba(255,59,59,0.3)' : undefined,
              }}
            >
              {type === 'url' ? 'Paste URL' : 'Upload File'}
            </button>
          ))}
        </div>
      )}

      {/* Audio source input */}
      {form.audioType === 'url' ? (
        <div>
          <label style={labelStyle}>Audio URL</label>
          <input
            type="url"
            value={form.audioUrl}
            onChange={(e) => update('audioUrl', e.target.value)}
            placeholder="https://example.com/episode.mp3"
            style={inputStyle}
            required={!isEditing}
            onFocus={onFocusGlow}
            onBlur={onBlurGlow}
          />
          <p className="text-xs mt-1" style={{ color: '#e5e2e1', opacity: 0.3, fontFamily: "'Space Grotesk', sans-serif" }}>
            Note: Some podcast CDNs block cross-origin requests.
          </p>
        </div>
      ) : (
        <div>
          <label style={labelStyle}>Audio File</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm cursor-pointer"
            style={{ color: '#e5e2e1' }}
          />
          <p className="text-xs mt-1" style={{ color: '#e5e2e1', opacity: 0.3, fontFamily: "'Space Grotesk', sans-serif" }}>
            Max 200 MB. MP3, M4A, OGG, WAV, AAC, FLAC.
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <label style={labelStyle}>Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Episode title"
          style={inputStyle}
          required
          onFocus={onFocusGlow}
          onBlur={onBlurGlow}
        />
      </div>

      {/* Show Name */}
      <div>
        <label style={labelStyle}>Show Name</label>
        <input
          type="text"
          value={form.showName}
          onChange={(e) => update('showName', e.target.value)}
          placeholder="Podcast show name"
          style={inputStyle}
          required
          onFocus={onFocusGlow}
          onBlur={onBlurGlow}
        />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Short description (optional)"
          rows={3}
          style={{ ...inputStyle, resize: 'none' }}
          onFocus={onFocusGlow}
          onBlur={onBlurGlow}
        />
      </div>

      {/* Thumbnail URL */}
      <div>
        <label style={labelStyle}>Thumbnail URL (optional)</label>
        <input
          type="url"
          value={form.thumbnailUrl}
          onChange={(e) => update('thumbnailUrl', e.target.value)}
          placeholder="https://example.com/cover.jpg"
          style={inputStyle}
          onFocus={onFocusGlow}
          onBlur={onBlurGlow}
        />
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>Category (optional)</label>
        <input
          type="text"
          list="episode-categories"
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="e.g. Technology, True Crime…"
          style={inputStyle}
          onFocus={onFocusGlow}
          onBlur={onBlurGlow}
        />
        {categories.length > 0 && (
          <datalist id="episode-categories">
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-3 py-2 text-sm"
          style={{ background: 'rgba(255,59,59,0.08)', borderLeft: '2px solid #FF3B3B', color: '#ffb3ac' }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 text-sm font-medium uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: '#FF3B3B',
            color: '#410003',
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: '0 0 8px rgba(255,59,59,0.3)',
          }}
        >
          {uploading ? 'Uploading…' : saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Add Episode'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="py-2 px-4 text-sm uppercase tracking-wider transition-colors disabled:opacity-50"
            style={{
              background: 'transparent',
              border: '1px solid rgba(93,63,60,0.5)',
              color: '#e5e2e1',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
