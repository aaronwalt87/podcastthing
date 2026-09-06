export type MarketState = 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'

/** Where a quote came from — surfaced in the UI so numbers are never anonymous. */
export type QuoteSource = 'finnhub' | 'stooq'

export interface StockQuote {
  symbol: string
  name: string
  /** Grouping used by the market heatmap. */
  sector: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  /** Daily closes, oldest → newest. Drives the sparklines. */
  history: number[]
  marketState: MarketState
  source: QuoteSource
  updatedAt: number
}

export interface MarketSnapshot {
  quotes: StockQuote[]
  /** Share of tracked names closing up — simple breadth readout. */
  advancers: number
  decliners: number
  marketState: MarketState
  updatedAt: number
}

/** Display labels for a session state. Kept in the types leaf so client
 *  components can import it without pulling the Redis-backed lib into their
 *  bundle graph. */
export const MARKET_STATE_LABEL: Record<MarketState, string> = {
  REGULAR: 'Open',
  PRE: 'Pre-market',
  POST: 'After hours',
  CLOSED: 'Closed',
}
