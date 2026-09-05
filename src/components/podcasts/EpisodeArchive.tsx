'use client'

import { useMemo, useState } from 'react'
import EpisodeCard from './EpisodeCard'
import type { Episode } from '@/types/episode'

type SortKey = 'newest' | 'oldest' | 'title'

interface EpisodeArchiveProps {
  episodes: Episode[]
  categories: string[]
  shows: string[]
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'title', label: 'A–Z' },
]

export default function EpisodeArchive({ episodes, categories, shows }: EpisodeArchiveProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [show, setShow] = useState('All')
  const [sort, setSort] = useState<SortKey>('newest')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    const result = episodes.filter((ep) => {
      if (category !== 'All' && ep.category !== category) return false
      if (show !== 'All' && ep.showName !== show) return false
      if (q && !`${ep.title} ${ep.showName} ${ep.description}`.toLowerCase().includes(q)) {
        return false
      }
      return true
    })

    switch (sort) {
      case 'oldest':
        return result.sort((a, b) => a.addedAt - b.addedAt)
      case 'title':
        return result.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return result.sort((a, b) => b.addedAt - a.addedAt)
    }
  }, [episodes, query, category, show, sort])

  const reset = () => {
    setQuery('')
    setCategory('All')
    setShow('All')
    setSort('newest')
  }

  const filtersActive = query !== '' || category !== 'All' || show !== 'All'

  if (episodes.length === 0) {
    return (
      <div className="panel-flat px-6 py-20 text-center">
        <p className="display text-2xl text-paper">Nothing in the archive yet.</p>
        <p className="mx-auto mt-3 max-w-[48ch] text-sm text-paper-2">
          This is a hand-picked list of episodes on infrastructure, AI, and how technology work
          actually gets done — not a firehose. New ones land as they turn out to be worth the time.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-sm lg:flex-1">
          <label htmlFor="episode-search" className="sr-only">
            Search episodes
          </label>
          <input
            id="episode-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search episodes…"
            className="field pl-9"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-3"
          >
            ⌕
          </span>
        </div>

        <div className="flex flex-wrap gap-2 lg:ml-auto">
          {categories.length > 0 && (
            <div>
              <label htmlFor="episode-category" className="sr-only">
                Filter by category
              </label>
              <select
                id="episode-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="field w-auto cursor-pointer pr-8"
              >
                <option value="All">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {shows.length > 1 && (
            <div>
              <label htmlFor="episode-show" className="sr-only">
                Filter by show
              </label>
              <select
                id="episode-show"
                value={show}
                onChange={(e) => setShow(e.target.value)}
                className="field w-auto cursor-pointer pr-8"
              >
                <option value="All">All shows</option>
                {shows.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className="flex items-center rounded-sm border border-hair p-0.5"
            role="group"
            aria-label="Sort episodes"
          >
            {SORTS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                aria-pressed={sort === key}
                className="seg"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <p aria-live="polite" className="eyebrow">
          {filtered.length} of {episodes.length} episodes
        </p>
        {filtersActive && (
          <button type="button" onClick={reset} className="link-draw text-xs">
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="panel-flat px-6 py-16 text-center">
          <p className="text-paper-2">No episodes match those filters.</p>
          <button type="button" onClick={reset} className="btn btn-sm mt-4">
            Clear filters
          </button>
        </div>
      ) : filtered.length <= 2 ? (
        // One or two results get the wide treatment rather than a lonely
        // third-width card with an empty row beside it.
        <div className="flex flex-col gap-5">
          {filtered.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} queue={filtered} featured />
          ))}
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
            filtered.length === 4 ? '' : 'lg:grid-cols-3'
          }`}
        >
          {filtered.map((ep) => (
            <EpisodeCard key={ep.id} episode={ep} queue={filtered} />
          ))}
        </div>
      )}
    </div>
  )
}
