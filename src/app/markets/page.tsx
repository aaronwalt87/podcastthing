import type { Metadata } from 'next'
import { getMarketSnapshot } from '@/lib/stocks'
import TechObservatory from '@/components/markets/TechObservatory'
import MarketTable from '@/components/markets/MarketTable'
import { quoteTime } from '@/lib/format'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
export const metadata: Metadata = { title: 'Markets', description: 'A technology stock landscape, dated performance comparisons, and the quotes behind them.' }

export default async function MarketsPage() {
  const snapshot = await getMarketSnapshot()
  return <div className="shell py-10 md:py-14">
    <header className="flex flex-wrap items-end justify-between gap-5 border-b border-hair pb-7">
      <div><p className="eyebrow">AW–01 / Channel 02</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Tech observatory</h1><p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-paper-2">Follow the companies shaping technology. Inspect a move, compare the paths, and see the numbers behind it.</p></div>
      <p className="max-w-[30ch] text-xs leading-relaxed text-paper-3">Cached quotes · USD<br />Last refresh: {quoteTime(snapshot.updatedAt)}<br />Individual quote dates may differ.</p>
    </header>
    {snapshot.quotes.length ? <>
      <TechObservatory quotes={snapshot.quotes} now={Date.now()} />
      <section className="mt-12 pb-8" aria-labelledby="full-board"><p className="eyebrow">03 / Full board</p><h2 id="full-board" className="mb-6 mt-2 text-2xl font-semibold tracking-tight">Every tracked name</h2><MarketTable quotes={snapshot.quotes} /></section>
    </> : <section className="panel-flat my-10 px-6 py-16"><h2 className="text-2xl">The board is waiting for data.</h2><p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-paper-2">Quotes are temporarily unavailable. The scheduled refresh will try again; no sample prices are shown here.</p></section>}
  </div>
}
