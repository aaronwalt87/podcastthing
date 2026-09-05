'use client'

import { useMemo, useState } from 'react'
import Sparkline from './Sparkline'
import Delta from './Delta'
import { num } from '@/lib/format'
import type { StockQuote } from '@/types/stocks'

type SortKey = 'symbol' | 'price' | 'changePercent' | 'sector'
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string; align: 'left' | 'right'; hideBelow?: string }[] = [
  { key: 'symbol', label: 'Symbol', align: 'left' },
  { key: 'sector', label: 'Sector', align: 'left', hideBelow: 'md' },
  { key: 'price', label: 'Last', align: 'right' },
  { key: 'changePercent', label: 'Change', align: 'right' },
]

export default function MarketTable({ quotes }: { quotes: StockQuote[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('changePercent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const copy = [...quotes]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp =
        typeof av === 'string' && typeof bv === 'string'
          ? av.localeCompare(bv)
          : Number(av) - Number(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [quotes, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      // Names read best A→Z; numbers read best biggest-first.
      setSortDir(key === 'symbol' || key === 'sector' ? 'asc' : 'desc')
    }
  }

  if (quotes.length === 0) return null

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <caption className="sr-only">
            Tracked technology equities, sorted by {sortKey} {sortDir === 'asc' ? 'ascending' : 'descending'}
          </caption>
          <thead>
            <tr className="border-b border-hair">
              {COLUMNS.map(({ key, label, align, hideBelow }) => {
                const active = sortKey === key
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={`${hideBelow === 'md' ? 'hidden md:table-cell' : ''} p-0`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className={`flex w-full items-center gap-1.5 px-4 py-3 text-left transition-colors hover:text-paper ${
                        align === 'right' ? 'justify-end' : ''
                      } ${active ? 'text-paper' : 'text-paper-3'}`}
                    >
                      <span className="eyebrow" style={{ color: 'inherit' }}>
                        {label}
                      </span>
                      <span aria-hidden="true" className={active ? 'opacity-100' : 'opacity-0'}>
                        {sortDir === 'asc' ? '↑' : '↓'}
                      </span>
                    </button>
                  </th>
                )
              })}
              <th scope="col" className="hidden px-4 py-3 text-right sm:table-cell">
                <span className="eyebrow">60d</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {sorted.map((q) => (
              <tr
                key={q.symbol}
                className="border-b border-hair/60 transition-colors last:border-0 hover:bg-white/[0.025]"
              >
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <span className="num text-[13px] font-medium text-paper">{q.symbol}</span>
                  <span className="ml-2 hidden text-xs text-paper-3 lg:inline">{q.name}</span>
                </th>
                <td className="hidden px-4 py-3 text-xs text-paper-3 md:table-cell">{q.sector}</td>
                <td className="num px-4 py-3 text-right text-paper">{num(q.price)}</td>
                <td className="px-4 py-3 text-right">
                  <Delta changePercent={q.changePercent} change={q.change} showAbsolute />
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <div className="flex justify-end">
                    <Sparkline id={`tbl-${q.symbol}`} points={q.history} width={96} height={26} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
