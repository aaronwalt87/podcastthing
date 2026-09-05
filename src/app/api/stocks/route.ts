import { NextResponse } from 'next/server'
import { getMarketSnapshot } from '@/lib/stocks'

export const dynamic = 'force-dynamic'

export async function GET() {
  const snapshot = await getMarketSnapshot()
  return NextResponse.json(snapshot, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  })
}
