import type { DailyClose, StockQuote } from '@/types/stocks'

/** Reject malformed dates and prices rather than plotting plausible-looking noise. */
export function cleanHistory(input: DailyClose[]): DailyClose[] {
  const unique = new Map<string, number>()
  for (const point of input) {
    if (!point || !/^\d{4}-\d{2}-\d{2}$/.test(point.date)) continue
    const time = Date.parse(`${point.date}T00:00:00Z`)
    if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== point.date) continue
    if (typeof point.close !== 'number' || !Number.isFinite(point.close) || point.close <= 0) continue
    unique.set(point.date, point.close)
  }
  return Array.from(unique, ([date, close]) => ({ date, close })).sort((a, b) => a.date.localeCompare(b.date))
}

export function parseHistoryCsv(csv: string): DailyClose[] {
  const rows = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/)
  const columns = (rows.shift() ?? '').toLowerCase().split(',').map(value => value.trim())
  const dateIndex = columns.indexOf('date'), closeIndex = columns.indexOf('close')
  if (dateIndex < 0 || closeIndex < 0) return []
  return cleanHistory(rows.map(row => {
    const cells = row.split(',')
    return { date: (cells[dateIndex] ?? '').trim(), close: Number(cells[closeIndex]) }
  }))
}

export type HistoryRange = '1M' | '3M' | 'ALL'

/** All series use the same observed trading dates and baseline. No gap filling. */
export function compareHistory(quotes: StockQuote[], range: HistoryRange) {
  const usable = quotes.map(quote => ({ quote, points: cleanHistory(quote.dailyHistory ?? []) }))
    .filter(item => item.points.length >= 2)
  const missing = quotes.filter(quote => !usable.some(item => item.quote.symbol === quote.symbol)).map(q => q.symbol)
  if (!usable.length) return { dates: [] as string[], series: [], missing }
  const maps = usable.map(item => new Map(item.points.map(point => [point.date, point.close])))
  let dates = usable[0].points.map(point => point.date).filter(date => maps.every(map => map.has(date)))
  if (range !== 'ALL' && dates.length) {
    const end = Date.parse(`${dates[dates.length - 1]}T00:00:00Z`)
    const cutoff = new Date(end - (range === '1M' ? 30 : 90) * 86_400_000).toISOString().slice(0, 10)
    dates = dates.filter(date => date >= cutoff)
  }
  if (dates.length < 2) return { dates, series: [], missing }
  const series = usable.map((item, index) => {
    const baseline = maps[index].get(dates[0])!
    return { symbol: item.quote.symbol, name: item.quote.name,
      values: dates.map(date => ({ date, value: (maps[index].get(date)! / baseline - 1) * 100 })) }
  })
  return { dates, series, missing }
}

/** Retain a last-good quote/history on an upstream failure without making it fresh. */
export function retainMarketData(fresh: StockQuote | null, previous?: StockQuote): StockQuote | null {
  if (!fresh) return previous ?? null
  if ((fresh.dailyHistory?.length ?? 0) >= 2 || (previous?.dailyHistory?.length ?? 0) < 2) return fresh
  return { ...fresh, dailyHistory: previous!.dailyHistory,
    history: previous!.dailyHistory!.map(point => point.close), historyFetchedAt: previous!.historyFetchedAt }
}
