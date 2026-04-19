import { NextResponse } from 'next/server'
import { getCachedNews } from '@/lib/news'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await getCachedNews()
    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/news error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
