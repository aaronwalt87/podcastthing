'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { compareHistory, type HistoryRange } from '@/lib/market-history'
import { longDate, num, pct, quoteTime } from '@/lib/format'
import type { StockQuote } from '@/types/stocks'
import styles from './TechObservatory.module.css'

const INKS = ['var(--signal-orange)', 'var(--screen-blue)', 'var(--chart-violet)', 'var(--screen-ink)']
const DASHES = ['', '8 3', '2 4', '10 4 2 4']

export default function TechObservatory({ quotes, now }: { quotes: StockQuote[]; now: number }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartWidth, setChartWidth] = useState(700)
  useEffect(() => {
    const node = chartRef.current
    if (!node) return
    const observer = new ResizeObserver(entries => setChartWidth(Math.max(240, entries[0].contentRect.width)))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const equities = quotes.filter(q => q.sector !== 'Index')
  const [sector, setSector] = useState('All sectors')
  const [focused, setFocused] = useState(equities.find(q => q.symbol === 'NVDA')?.symbol ?? equities[0]?.symbol)
  const [selected, setSelected] = useState(() => equities.filter(q => ['NVDA', 'AMD'].includes(q.symbol)).map(q => q.symbol))
  const [benchmark, setBenchmark] = useState(true)
  const [range, setRange] = useState<HistoryRange>('3M')
  const [cursor, setCursor] = useState<string | null>(null)
  const quote = equities.find(q => q.symbol === focused)
  const sectors = Array.from(new Set(equities.map(q => q.sector)))
  const compared = useMemo(() => [...selected.map(symbol => quotes.find(q => q.symbol === symbol)!),
    ...(benchmark ? quotes.filter(q => q.symbol === 'QQQ') : [])], [quotes, selected, benchmark])
  const comparison = useMemo(() => compareHistory(compared, range), [compared, range])
  const { dates, series, missing } = comparison
  const active = Math.max(0, cursor && dates.includes(cursor) ? dates.indexOf(cursor) : dates.length - 1)
  const values = series.flatMap(item => item.values.map(point => point.value))
  const low = Math.min(0, ...values), high = Math.max(0, ...values)
  const padding = Math.max(1, (high - low) * 0.12)
  const min = low - padding, max = high + padding
  const y = (value: number) => 18 + (max - value) / (max - min) * 214
  const start = Date.parse(dates[0]), end = Date.parse(dates[dates.length - 1])
  const x = (date: string) => 56 + (Date.parse(date) - start) / (end - start || 1) * (chartWidth - 72)
  const selectedQuote = quote && selected.includes(quote.symbol)
  const toggle = (symbol: string) => {
    setSelected(previous => previous.includes(symbol) ? previous.filter(value => value !== symbol) : previous.length < 3 ? [...previous, symbol] : previous)
    setCursor(null)
  }
  const advancing = equities.filter(q => q.changePercent > 0).length
  const declining = equities.filter(q => q.changePercent < 0).length
  const stale = equities.filter(q => !q.updatedAt || now - q.updatedAt > 36 * 3_600_000).length

  return <div className={styles.observatory} >
    <div className={styles.readout}>
      <p><strong>{equities.length}</strong> tracked tech names</p>
      <p><strong className={styles.positive}>{advancing} ↑</strong> advancing</p>
      <p><strong className={styles.negative}>{declining} ↓</strong> declining</p>
      <p><strong>{equities.length - advancing - declining}</strong> unchanged</p>
    </div>
    {stale > 0 && <p className={styles.note}>{stale} quotes are over 36 hours old or have no provider timestamp. Select a tile to check its date.</p>}
    <section aria-labelledby="heatmap-title">
      <div className={styles.sectionHead}>
        <div><p className="eyebrow">01 / Tech landscape</p><h2 id="heatmap-title">Find the move.</h2></div>
        <label className={styles.filter}>Sector<select value={sector} onChange={e => setSector(e.target.value)}><option>All sectors</option>{sectors.map(value => <option key={value}>{value}</option>)}</select></label>
      </div>
      <p className={styles.note}>Select a company to inspect it. Equal-sized tiles; color intensity shows change against the previous close, capped at ±3%.</p>
      <div className={styles.landscape}>
        <div className={styles.sectors}>
          {sectors.filter(value => sector === 'All sectors' || value === sector).map(value => <div key={value} className={styles.sector}>
            <h3>{value}</h3><div className={styles.tiles}>{equities.filter(q => q.sector === value).map(q => <button type="button" key={q.symbol}
              className={styles.tile} aria-pressed={focused === q.symbol} onClick={() => setFocused(q.symbol)}
              aria-label={`${q.name}, ${q.symbol}, ${pct(q.changePercent)}. Inspect quote.`}
              style={{ '--tile-color': q.changePercent > 0 ? 'var(--pos)' : q.changePercent < 0 ? 'var(--neg)' : 'var(--paper-3)', '--tile-weight': `${8 + Math.min(Math.abs(q.changePercent), 3) / 3 * 20}%` } as CSSProperties}>
              <strong>{q.symbol}</strong><span>{pct(q.changePercent)}</span><small>{selected.includes(q.symbol) ? 'In comparison' : q.name}</small>
            </button>)}</div>
          </div>)}
        </div>
        <aside className={styles.detail} aria-label="Selected company">
          {quote ? <>
            <p className="eyebrow">Inspect / {quote.sector}</p>
            <h3>{quote.symbol}<span>{quote.name}</span></h3>
            <p className={styles.price}>${num(quote.price)}</p>
            <p className={quote.changePercent >= 0 ? styles.positive : styles.negative}>{pct(quote.changePercent)} <span className={styles.muted}>vs previous close</span></p>
            <dl><div><dt>Previous close</dt><dd>${num(quote.previousClose)}</dd></div><div><dt>Source</dt><dd>{quote.source === 'finnhub' ? 'Finnhub quote' : 'Stooq daily close'}</dd></div><div><dt>Quote date</dt><dd>{quoteTime(quote.updatedAt, quote.source === 'stooq')}</dd></div><div><dt>Daily history</dt><dd>{quote.dailyHistory?.length ? `${quote.dailyHistory.length} closes · through ${quote.dailyHistory.at(-1)!.date}` : 'Unavailable'}</dd></div></dl>
            <button type="button" className="btn btn-primary" disabled={!selectedQuote && selected.length >= 3} onClick={() => toggle(quote.symbol)}>{selectedQuote ? 'Remove from comparison' : 'Add to comparison'}</button>
            <p className={styles.note}>{!selectedQuote && selected.length >= 3 ? 'Remove a selected stock below to make room.' : 'Compare up to 3 stocks alongside QQQ.'}</p>
          </> : <p>No technology quotes are available yet.</p>}
        </aside>
      </div>
    </section>
    <section className={styles.display} aria-labelledby="comparison-title">
      <div className={styles.sectionHead}>
        <div><p className={styles.displayLabel}>02 / Relative performance</p><h2 id="comparison-title">Same start. Different paths.</h2></div>
        <div role="group" aria-label="History window" className={styles.ranges}>{(['1M', '3M', 'ALL'] as HistoryRange[]).map(value => <button type="button" key={value} aria-pressed={range === value} onClick={() => { setRange(value); setCursor(null) }}>{value === 'ALL' ? 'All' : value}</button>)}</div>
      </div>
      <div ref={chartRef} className={styles.controls}>
        <div className={styles.chips} aria-label="Selected stocks">{selected.map(symbol => <button type="button" key={symbol} onClick={() => toggle(symbol)} aria-label={`Remove ${symbol} from comparison`}>{symbol} <span aria-hidden="true">×</span></button>)}{selected.length === 0 && <span>Select a stock above.</span>}</div>
        <label className={styles.benchmark}><input type="checkbox" checked={benchmark} disabled={!quotes.some(q => q.symbol === 'QQQ')} onChange={e => { setBenchmark(e.target.checked); setCursor(null) }} /> QQQ benchmark</label>
      </div>
      {series.length ? <>
        <p className={styles.chartCaption}>{longDate(start)} — {longDate(end)} · {dates.length} shared trading dates · rebased to 0%</p>
        <svg className={styles.chart} viewBox={`0 0 ${chartWidth} 270`} role="img" aria-label={`Price change comparison from ${dates[0]} to ${dates.at(-1)}. Use the date slider below for exact values.`}>
          {[0, 1, 2, 3, 4].map(i => { const value = min + (max - min) * i / 4; return <g key={i}><line x1="56" x2={chartWidth - 16} y1={y(value)} y2={y(value)} stroke="var(--screen-line)" /><text x="47" y={y(value) + 4} textAnchor="end">{num(value, 1)}%</text></g> })}
          <line x1="56" x2={chartWidth - 16} y1={y(0)} y2={y(0)} stroke="var(--screen-muted)" strokeDasharray="3 5" />
          {series.map((item, index) => <path key={item.symbol} d={item.values.map((point, i) => `${i ? 'L' : 'M'}${x(point.date)},${y(point.value)}`).join(' ')} fill="none" stroke={item.symbol === 'QQQ' ? INKS[3] : INKS[index]} strokeWidth="2.5" strokeDasharray={item.symbol === 'QQQ' ? DASHES[3] : DASHES[index]} vectorEffect="non-scaling-stroke" />)}
          <line x1={x(dates[active])} x2={x(dates[active])} y1="18" y2="232" stroke="var(--screen-muted)" />
          {series.map((item, index) => <circle key={item.symbol} cx={x(dates[active])} cy={y(item.values[active].value)} r="4" fill={item.symbol === 'QQQ' ? INKS[3] : INKS[index]} stroke="var(--screen)" />)}
          <text x="56" y="259">{dates[0]}</text><text x={chartWidth - 16} y="259" textAnchor="end">{dates.at(-1)}</text>
        </svg>
        <label className={styles.scrubber}>Inspect date <strong>{dates[active]}</strong><input type="range" min="0" max={dates.length - 1} value={active} onChange={e => setCursor(dates[Number(e.target.value)])} aria-valuetext={longDate(Date.parse(dates[active]))} /></label>
        <div className={styles.legend}>{series.map((item, index) => <div key={item.symbol} style={{ color: item.symbol === 'QQQ' ? INKS[3] : INKS[index] }}><span><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray={item.symbol === 'QQQ' ? DASHES[3] : DASHES[index]} /></svg>{item.symbol}</span><strong>{pct(item.values[active].value)}</strong></div>)}</div>
      </> : <div className={styles.empty}><h3>{compared.length ? 'Daily history is not ready.' : 'Choose your comparison.'}</h3><p>{compared.length ? 'The selected names need at least two shared trading dates. Available quotes remain on the board above.' : 'Add stocks from the landscape above or enable the QQQ benchmark.'}</p></div>}
      <p className={styles.chartCaption} aria-live="polite">{missing.length > 0 ? `No dated history for ${missing.join(', ')}. ` : ''}Daily closing prices from Stooq. Change over the available window, not total return. Quote tiles may have a newer timestamp.</p>
    </section>
  </div>
}
