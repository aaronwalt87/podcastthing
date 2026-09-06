import { NextResponse } from 'next/server'
import { getMarketSnapshot } from '@/lib/stocks'

export const dynamic = 'force-dynamic'
// A cold cache triggers a background refresh through waitUntil, which keeps the
// invocation alive but is still bounded by maxDuration — 10s by default, which
// a slow upstream can exceed.
export const maxDuration = 60

export async function GET() {
  const snapshot = await getMarketSnapshot()
  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}
