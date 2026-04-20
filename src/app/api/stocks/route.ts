import { NextResponse } from 'next/server'
import { getCachedStocks } from '@/lib/stocks'

export const dynamic = 'force-dynamic'

export async function GET() {
  const stocks = await getCachedStocks()
  return NextResponse.json(stocks)
}
