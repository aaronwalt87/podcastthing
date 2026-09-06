import { NextResponse } from 'next/server'
import { refreshNews } from '@/lib/news'

export const dynamic = 'force-dynamic'
// Sixteen feeds plus six HN queries needs more than the default 10s budget.
export const maxDuration = 60

// Vercel Cron always sends GET requests
export async function GET(request: Request) {
  const auth = request.headers.get('Authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items = await refreshNews()
    return NextResponse.json({ refreshed: items.length, ok: true })
  } catch (error) {
    console.error('GET /api/news/refresh error:', error)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 })
  }
}
