import { NextResponse } from 'next/server'
import { refreshStocks } from '@/lib/stocks'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = request.headers.get('Authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const quotes = await refreshStocks()
    return NextResponse.json({ refreshed: quotes.length, ok: true })
  } catch (error) {
    console.error('GET /api/stocks/refresh error:', error)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}
