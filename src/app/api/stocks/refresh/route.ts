import { NextResponse } from 'next/server'
import { refreshStocks } from '@/lib/stocks'

export const dynamic = 'force-dynamic'
// Sixteen symbols x two upstreams needs more than the default 10s budget.
export const maxDuration = 60

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snapshot = await refreshStocks()
    return NextResponse.json({ ok: true, refreshed: snapshot.quotes.length })
  } catch (error) {
    console.error('GET /api/stocks/refresh error:', error)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}
