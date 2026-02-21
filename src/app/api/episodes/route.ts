import { NextResponse } from 'next/server'
import { getAllEpisodes, createEpisode } from '@/lib/episodes'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const episodes = await getAllEpisodes()
    return NextResponse.json(episodes)
  } catch (error) {
    console.error('GET /api/episodes error:', error)
    return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, showName, description, audioUrl, audioType, thumbnailUrl } = body

    if (!title || !showName || !audioUrl || !audioType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, showName, audioUrl, audioType' },
        { status: 400 }
      )
    }

    if (audioType !== 'upload' && audioType !== 'url') {
      return NextResponse.json(
        { error: 'audioType must be "upload" or "url"' },
        { status: 400 }
      )
    }

    const episode = await createEpisode({
      title,
      showName,
      description: description || '',
      audioUrl,
      audioType,
      thumbnailUrl: thumbnailUrl || undefined,
    })

    return NextResponse.json(episode, { status: 201 })
  } catch (error) {
    console.error('POST /api/episodes error:', error)
    return NextResponse.json({ error: 'Failed to create episode' }, { status: 500 })
  }
}
