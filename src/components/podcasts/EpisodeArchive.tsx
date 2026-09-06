'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import EpisodeCard from './EpisodeCard'
import EpisodeIndex from './EpisodeIndex'
import type { Episode } from '@/types/episode'

type SortKey = 'newest' | 'oldest' | 'title'

interface EpisodeArchiveProps {
  episodes: Episode[]
  categories: string[]
  shows: string[]
}

/** Rendered at once; the rest arrive on demand. Keeps a large archive usable. */
const PAGE_SIZE = 40

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
  const [visible, setVisible] = useState(PAGE_SIZE)

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

  // Any change to the result set starts the window over.
  useEffect(() => setVisible(PAGE_SIZE), [query, category, show, sort])

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
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/news" className="btn btn-sm">
            Read the headlines <span aria-hidden="true">→</span>
          </Link>
          <Link href="/markets" className="btn btn-sm">
            See the board <span aria-hidden="true">→</span>
          </Link>
        </div>
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
      ) : (
        // A lead card and a numbered index, not a card grid: an archive scans
        // in one column, the row height stops depending on how a title wraps,
        // and a single filtered result can never be a lonely third-width card.
        <div className="flex flex-col gap-2">
          <EpisodeCard episode={filtered[0]} queue={filtered} featured />
          {filtered.length > 1 && (
            <EpisodeIndex episodes={filtered.slice(1, visible)} queue={filtered} startAt={2} />
          )}

          {filtered.length > visible && (
            <div className="mt-6 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="btn"
              >
                Show more episodes
              </button>
              <p className="eyebrow">
                Showing {visible} of {filtered.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
