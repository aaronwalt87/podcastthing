import { getCachedStocks } from '@/lib/stocks'
import type { StockQuote } from '@/types/stocks'

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function ChangeLabel({ pct, change }: { pct: number; change: number }) {
  const up = pct >= 0
  return (
    <span
      className="font-mono text-xs tabular-nums"
      style={{ color: up ? '#00FF41' : '#FF3B3B' }}
    >
      {up ? '▲' : '▼'} {up ? '+' : ''}{fmt(pct, 2)}%
      <span style={{ color: up ? 'rgba(0,255,65,0.5)' : 'rgba(255,59,59,0.5)', marginLeft: 4 }}>
        ({up ? '+' : ''}{fmt(change, 2)})
      </span>
    </span>
  )
}

function MoverRow({ stock }: { stock: StockQuote }) {
  const up = stock.changePercent >= 0
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color: 'var(--text-primary)', minWidth: 44 }}>
        {stock.symbol}
      </span>
      <ChangeLabel pct={stock.changePercent} change={stock.change} />
      <span className="font-mono text-xs tabular-nums ml-auto flex-shrink-0" style={{ color: 'rgba(185,204,178,0.7)' }}>
        ${fmt(stock.price)}
      </span>
    </div>
  )
}

export default async function StockTicker() {
  const stocks = await getCachedStocks()
  if (stocks.length === 0) return null

  const sp500 = stocks.find((s) => s.symbol === 'SPY')
  const tech = stocks.filter((s) => s.symbol !== 'SPY')

  // Top 2 gainers + top 1 loser by absolute % change
  const sorted = [...tech].sort((a, b) => b.changePercent - a.changePercent)
  const movers = [
    ...sorted.slice(0, 2),
    sorted[sorted.length - 1],
  ]

  const marketState = stocks[0]?.marketState ?? 'CLOSED'
  const isOpen = marketState === 'REGULAR'
  const stateLabel = marketState === 'REGULAR' ? 'OPEN' : marketState === 'PRE' ? 'PRE-MKT' : marketState === 'POST' ? 'AFTER-HRS' : 'CLOSED'
  const stateColor = isOpen ? '#00FF41' : '#fdbb2c'

  return (
    <div
      className="glass flex flex-col rounded-lg overflow-hidden"
      style={{ borderLeft: '2px solid rgba(0,255,65,0.5)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          className="text-xs uppercase tracking-widest"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00FF41' }}
        >
          MARKET_FEED_
        </span>
        <span className="blink text-xs" style={{ color: '#00FF41' }}>▮</span>
        <span
          className="ml-auto font-mono text-xs uppercase tracking-wider"
          style={{ color: stateColor, fontSize: '10px' }}
        >
          ● {stateLabel}
        </span>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {/* S&P 500 */}
        {sp500 && (
          <div
            className="flex flex-col justify-center px-4 py-3 gap-1"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(0,255,65,0.5)', fontSize: '9px' }}
            >
              S&amp;P 500
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {fmt(sp500.price, 2)}
            </span>
            <ChangeLabel pct={sp500.changePercent} change={sp500.change} />
          </div>
        )}

        {/* Top movers */}
        <div className="flex flex-col">
          <div
            className="px-3 py-1.5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,255,65,0.03)' }}
          >
            <span
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'rgba(0,255,65,0.5)', fontSize: '9px' }}
            >
              TOP MOVERS
            </span>
          </div>
          {movers.map((s) => (
            <MoverRow key={s.symbol} stock={s} />
          ))}
        </div>
      </div>
    </div>
  )
}
