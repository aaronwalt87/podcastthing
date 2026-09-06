'use client'

import { useId, useState } from 'react'
import { upload } from '@vercel/blob/client'
import type { Episode } from '@/types/episode'

interface EpisodeFormProps {
  episode?: Episode
  onSuccess: (episode: Episode) => void
  onCancel?: () => void
  categories?: string[]
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-1.5 block">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-paper-3">{hint}</p>}
    </div>
  )
}

export default function EpisodeForm({
  episode,
  onSuccess,
  onCancel,
  categories = [],
}: EpisodeFormProps) {
  const isEditing = Boolean(episode)
  const uid = useId()

  const [form, setForm] = useState({
    title: episode?.title ?? '',
    showName: episode?.showName ?? '',
    description: episode?.description ?? '',
    audioUrl: episode?.audioUrl ?? '',
    thumbnailUrl: episode?.thumbnailUrl ?? '',
    category: episode?.category ?? '',
    transcriptUrl: episode?.transcriptUrl ?? '',
    sourceUrl: episode?.sourceUrl ?? '',
    audioType: episode?.audioType ?? ('url' as 'upload' | 'url'),
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
      const res = await fetch(isEditing ? `/api/episodes/${episode!.id}` : '/api/episodes', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          showName: form.showName.trim(),
          description: form.description.trim(),
          audioUrl,
          audioType: form.audioType,
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
          category: form.category.trim() || undefined,
          transcriptUrl: form.transcriptUrl.trim() || undefined,
          sourceUrl: form.sourceUrl.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {!isEditing && (
        <div
          className="flex rounded-sm border border-hair p-0.5"
          role="group"
          aria-label="Audio source"
        >
          {(['url', 'upload'] as const).map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={form.audioType === type}
              onClick={() => {
                update('audioType', type)
                setFile(null)
                update('audioUrl', '')
              }}
              className={`flex-1 rounded-xs py-2 text-xs transition-colors ${
                form.audioType === type
                  ? 'bg-white/[0.07] text-paper'
                  : 'text-paper-3 hover:text-paper'
              }`}
            >
              {type === 'url' ? 'Paste a URL' : 'Upload a file'}
            </button>
          ))}
        </div>
      )}

      {form.audioType === 'url' ? (
        <Field
          id={`${uid}-audio`}
          label="Audio URL"
          hint="Some podcast CDNs block cross-origin playback; test the link after saving."
        >
          <input
            id={`${uid}-audio`}
            type="url"
            value={form.audioUrl}
            onChange={(e) => update('audioUrl', e.target.value)}
            placeholder="https://example.com/episode.mp3"
            className="field"
            required={!isEditing}
          />
        </Field>
      ) : (
        <Field
          id={`${uid}-file`}
          label="Audio file"
          hint="Up to 200 MB — MP3, M4A, OGG, WAV, AAC or FLAC."
        >
          <input
            id={`${uid}-file`}
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full cursor-pointer text-sm text-paper-2 file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-white/[0.07] file:px-3 file:py-2 file:text-xs file:text-paper"
          />
        </Field>
      )}

      <Field id={`${uid}-title`} label="Title">
        <input
          id={`${uid}-title`}
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Episode title"
          className="field"
          required
        />
      </Field>

      <Field id={`${uid}-show`} label="Show name">
        <input
          id={`${uid}-show`}
          type="text"
          value={form.showName}
          onChange={(e) => update('showName', e.target.value)}
          placeholder="Podcast show name"
          className="field"
          required
        />
      </Field>

      <Field id={`${uid}-desc`} label="Description">
        <textarea
          id={`${uid}-desc`}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Short description (optional)"
          rows={3}
          className="field resize-none py-2.5"
          style={{ height: 'auto' }}
        />
      </Field>

      <Field id={`${uid}-thumb`} label="Thumbnail URL (optional)">
        <input
          id={`${uid}-thumb`}
          type="url"
          value={form.thumbnailUrl}
          onChange={(e) => update('thumbnailUrl', e.target.value)}
          placeholder="https://example.com/cover.jpg"
          className="field"
        />
      </Field>

      <Field id={`${uid}-cat`} label="Category (optional)">
        <input
          id={`${uid}-cat`}
          type="text"
          list={`${uid}-categories`}
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          placeholder="Infrastructure, AI, Systems…"
          className="field"
        />
        {categories.length > 0 && (
          <datalist id={`${uid}-categories`}>
            {categories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        )}
      </Field>

      <Field
        id={`${uid}-transcript`}
        label="Transcript URL (optional)"
        hint="Audio-only content needs a text alternative (WCAG 1.2.1). Link the publisher's transcript where one exists — many podcast feeds carry one."
      >
        <input
          id={`${uid}-transcript`}
          type="url"
          value={form.transcriptUrl}
          onChange={(e) => update('transcriptUrl', e.target.value)}
          placeholder="https://example.com/episode/transcript"
          className="field"
        />
      </Field>

      <Field
        id={`${uid}-source`}
        label="Episode page (optional)"
        hint="Shown when there is no transcript, so a listener still has somewhere to go."
      >
        <input
          id={`${uid}-source`}
          type="url"
          value={form.sourceUrl}
          onChange={(e) => update('sourceUrl', e.target.value)}
          placeholder="https://example.com/episode"
          className="field"
        />
      </Field>

      {error && (
        <p
          role="alert"
          className="alert"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={isLoading} className="btn btn-primary flex-1 disabled:opacity-50">
          {uploading ? 'Uploading…' : saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add episode'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="btn disabled:opacity-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
