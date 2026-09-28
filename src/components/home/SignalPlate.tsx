import Sparkline from '@/components/markets/Sparkline'
import { useId } from 'react'
import type { StockQuote } from '@/types/stocks'
import styles from './SignalPlate.module.css'

interface SignalPlateProps {
  quote: StockQuote | null
  label?: string
  variant?: 'hero' | 'band'
  height?: number | string
  children?: React.ReactNode
  className?: string
}

/** The black display always describes real cached market data. */
export default function SignalPlate({ quote, label, height = 168, children, className = '' }: SignalPlateProps) {
  const id = useId().replace(/:/g, '')
  return <div className={`${styles.scope} ${className}`} style={{minHeight: height}}>
    <div className={`shell ${styles.layout}`}>
      <div className={styles.caption}><span className={styles.label}>{label ?? (quote ? `${quote.symbol} / 60-DAY TREND` : 'MARKET DISPLAY')}</span><strong>{quote ? quote.price.toFixed(2) : '—'}</strong><span>{quote ? quote.source === 'finnhub' ? 'Live quote · daily close history' : 'End-of-day data' : 'Waiting for market data'}</span>{children}</div>
      <div className={styles.chart}>{quote && quote.history.length > 1 ? <Sparkline id={`scope-${id}`} points={quote.history} width={600} height={84} color="var(--signal-orange)" fill={false} /> : <span>No chart data available</span>}</div>
    </div>
  </div>
}
