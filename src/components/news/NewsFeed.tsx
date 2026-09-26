'use client'

import { useMemo, useState } from 'react'
import NewsRow from './NewsRow'
import type { NewsCategory, NewsItem } from '@/types/news'
import styles from './NewsFeed.module.css'

const CATEGORIES: (NewsCategory | 'All')[] = ['All', 'AI', 'Hardware', 'IT', 'Finance', 'Misc']

interface NewsFeedProps {
  items: NewsItem[]
  /** Rendered on the server; passed down so relative times don't shift on hydration. */
  now: number
}

export default function NewsFeed({ items, now }: NewsFeedProps) {
  const [category, setCategory] = useState<NewsCategory | 'All'>('All')
  const [source, setSource] = useState<string>('All')
  const [query, setQuery] = useState('')

  const sources = useMemo(
    () => ['All', ...Array.from(new Set(items.map((i) => i.source))).sort()],
    [items]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== 'All' && item.category !== category) return false
      if (source !== 'All' && item.source !== source) return false
      if (q && !`${item.title} ${item.summary}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [items, category, source, query])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items) map.set(item.category, (map.get(item.category) ?? 0) + 1)
    return map
  }, [items])

  return (
    <div className={styles.feed}>
      {/* Controls */}
      <div className={styles.controls}>
        <h2 className="text-2xl font-medium tracking-tight">Find your signal.</h2>
        <div className={styles.categories}>
          {CATEGORIES.map((cat) => {
            const active = category === cat
            const count = cat === 'All' ? items.length : (counts.get(cat) ?? 0)
            if (cat !== 'All' && count === 0) return null
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={`chip transition-colors ${active ? 'chip-accent' : 'hover:text-paper'}`}
              >
                {cat}
                <span className="text-paper-3">{count}</span>
              </button>
            )
          })}
        </div>

        <div className={styles.searches}>
          <div className="relative flex-1">
            <label htmlFor="news-search" className="sr-only">
              Search headlines
            </label>
            <input
              id="news-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search headlines…"
              className="field pl-9"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-paper-3"
            >
              ⌕
            </span>
          </div>

          <div>
            <label htmlFor="news-source" className="sr-only">
              Filter by source
            </label>
            <select
              id="news-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="field cursor-pointer"
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All sources' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.results}>
      {/* Result count — announced so filtering is perceivable without sight */}
      <p aria-live="polite" className={`eyebrow ${styles.resultCount}`}>
        {filtered.length} {filtered.length === 1 ? 'headline' : 'headlines'}
        {category !== 'All' && ` · ${category}`}
        {source !== 'All' && ` · ${source}`}
      </p>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="panel-flat px-6 py-14 text-center">
          <p className="text-paper-2">Nothing matches those filters.</p>
          <button
            type="button"
            className="btn btn-sm mt-4"
            onClick={() => {
              setCategory('All')
              setSource('All')
              setQuery('')
            }}
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className={styles.rows}>
          {filtered.map((item) => <NewsRow key={item.id} item={item} now={now} showSummary />)}
        </div>
      )}
      </div>
    </div>
  )
}
