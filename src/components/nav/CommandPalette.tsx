'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SearchRecord } from '@/app/api/search/route'

const NAV_RECORDS: SearchRecord[] = [
  { id: 'nav-home', kind: 'symbol', title: 'Home', subtitle: 'Overview', href: '/', external: false },
  { id: 'nav-podcasts', kind: 'symbol', title: 'Podcasts', subtitle: 'Episode archive', href: '/podcasts', external: false },
  { id: 'nav-news', kind: 'symbol', title: 'News', subtitle: 'Technology feed', href: '/news', external: false },
  { id: 'nav-markets', kind: 'symbol', title: 'Markets', subtitle: 'Tech equities', href: '/markets', external: false },
]

const KIND_LABEL: Record<SearchRecord['kind'], string> = {
  episode: 'Episode',
  news: 'Headline',
  symbol: 'Go to',
}

const MAX_RESULTS = 24

export default function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [records, setRecords] = useState<SearchRecord[]>([])
  const [loaded, setLoaded] = useState(false)
  const [active, setActive] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  /** Element focused before opening, so focus can be handed back on close. */
  const restoreFocus = useRef<HTMLElement | null>(null)

  /* ------------------------------------------------------------- open/close */

  const openPalette = useCallback(() => {
    restoreFocus.current = document.activeElement as HTMLElement | null
    setOpen(true)
    setQuery('')
    setActive(0)
  }, [])

  const closePalette = useCallback(() => {
    setOpen(false)
    restoreFocus.current?.focus?.()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isToggle = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'
      if (isToggle) {
        event.preventDefault()
        setOpen((wasOpen) => {
          if (wasOpen) return false
          restoreFocus.current = document.activeElement as HTMLElement | null
          setQuery('')
          setActive(0)
          return true
        })
      }
      // "/" is a search shortcut everywhere except inside a text field.
      const target = event.target as HTMLElement | null
      const typing =
        target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        openPalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openPalette])

  // Listen for the header button (avoids threading a ref through the tree).
  useEffect(() => {
    const onRequest = () => openPalette()
    window.addEventListener('signal:open-palette', onRequest)
    return () => window.removeEventListener('signal:open-palette', onRequest)
  }, [openPalette])

  /* -------------------------------------------------------------- the index */

  useEffect(() => {
    if (!open || loaded) return
    let cancelled = false

    fetch('/api/search')
      .then((res) => (res.ok ? res.json() : { records: [] }))
      .then((data: { records?: SearchRecord[] }) => {
        if (cancelled) return
        setRecords(data.records ?? [])
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [open, loaded])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  /* --------------------------------------------------------------- results */

  const results = useMemo(() => {
    const all = [...NAV_RECORDS, ...records]
    const q = query.trim().toLowerCase()
    if (!q) return all.slice(0, MAX_RESULTS)

    return all
      .map((record) => {
        const title = record.title.toLowerCase()
        const subtitle = record.subtitle.toLowerCase()
        // Rank exact prefixes above mid-string hits so typing feels responsive.
        if (title.startsWith(q)) return { record, score: 0 }
        if (title.includes(q)) return { record, score: 1 }
        if (subtitle.includes(q)) return { record, score: 2 }
        return null
      })
      .filter((hit): hit is { record: SearchRecord; score: number } => hit !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_RESULTS)
      .map((hit) => hit.record)
  }, [query, records])

  useEffect(() => setActive(0), [query])

  // Keep the highlighted row inside the scroll box.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const node = list.querySelector<HTMLElement>(`[data-index="${active}"]`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = useCallback(
    (record: SearchRecord) => {
      closePalette()
      if (record.external) {
        window.open(record.href, '_blank', 'noopener,noreferrer')
      } else {
        router.push(record.href)
      }
    },
    [closePalette, router]
  )

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length))
        break
      case 'Enter':
        event.preventDefault()
        if (results[active]) choose(results[active])
        break
      case 'Escape':
        event.preventDefault()
        closePalette()
        break
      default:
        break
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: 'rgba(4, 5, 7, 0.72)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="panel w-full max-w-xl overflow-hidden"
        style={{ boxShadow: 'var(--shadow-panel)' }}
      >
        <div className="flex items-center gap-3 border-b border-hair px-4">
          <span aria-hidden="true" className="text-paper-3">
            ⌕
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-option-${active}` : undefined}
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search episodes, headlines, tickers…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-paper-3"
          />
          <kbd className="chip">Esc</kbd>
        </div>

        <ul
          ref={listRef}
          id="palette-results"
          role="listbox"
          aria-label="Search results"
          className="max-h-[52vh] overflow-y-auto p-1.5"
        >
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-paper-3">
              {loaded ? 'No matches.' : 'Loading index…'}
            </li>
          ) : (
            results.map((record, i) => (
              <li key={record.id}>
                <button
                  type="button"
                  id={`palette-option-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(record)}
                  className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors ${
                    i === active ? 'bg-white/[0.06]' : ''
                  }`}
                >
                  <span className="chip shrink-0">{KIND_LABEL[record.kind]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-paper">{record.title}</span>
                    <span className="block truncate text-xs text-paper-3">{record.subtitle}</span>
                  </span>
                  {record.external && (
                    <span aria-hidden="true" className="shrink-0 text-xs text-paper-3">
                      ↗
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center gap-4 border-t border-hair px-4 py-2.5">
          <span className="eyebrow">↑↓ navigate</span>
          <span className="eyebrow">↵ open</span>
          <span className="eyebrow ml-auto">⌘K</span>
        </div>
      </div>
    </div>
  )
}
