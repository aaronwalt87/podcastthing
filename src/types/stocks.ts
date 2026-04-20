export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketState: 'REGULAR' | 'PRE' | 'POST' | 'CLOSED'
  updatedAt: number
}
