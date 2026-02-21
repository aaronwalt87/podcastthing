import { NextResponse } from 'next/server'
import { getEpisode, updateEpisode, deleteEpisode } from '@/lib/episodes'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const episode = await getEpisode(params.id)
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }
    return NextResponse.json(episode)
  } catch (error) {
    console.error(`GET /api/episodes/${params.id} error:`, error)
    return NextResponse.json({ error: 'Failed to fetch episode' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, showName, description, audioUrl, audioType, thumbnailUrl } = body

    const updated = await updateEpisode(params.id, {
      ...(title !== undefined && { title }),
      ...(showName !== undefined && { showName }),
      ...(description !== undefined && { description }),
      ...(audioUrl !== undefined && { audioUrl }),
      ...(audioType !== undefined && { audioType }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
    })

    if (!updated) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`PUT /api/episodes/${params.id} error:`, error)
    return NextResponse.json({ error: 'Failed to update episode' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteEpisode(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/episodes/${params.id} error:`, error)
    return NextResponse.json({ error: 'Failed to delete episode' }, { status: 500 })
  }
}
