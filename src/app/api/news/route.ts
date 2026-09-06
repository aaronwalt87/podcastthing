import { NextResponse } from 'next/server'
import { getCachedNews } from '@/lib/news'

export const dynamic = 'force-dynamic'
// A cold cache triggers a background refresh through waitUntil, which keeps the
// invocation alive but is still bounded by maxDuration — 10s by default, which
// a slow upstream can exceed.
export const maxDuration = 60

export async function GET() {
  try {
    const items = await getCachedNews()
    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/news error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
