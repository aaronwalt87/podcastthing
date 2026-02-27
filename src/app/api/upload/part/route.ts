import { NextResponse } from 'next/server'
import { uploadPart } from '@vercel/blob'

export const dynamic = 'force-dynamic'

// Allow up to 5 MB body (chunk size is 4 MB + overhead)
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as File | null
    const uploadId = formData.get('uploadId') as string
    const key = formData.get('key') as string
    const pathname = formData.get('pathname') as string
    const partNumber = Number(formData.get('partNumber'))

    if (!chunk || !uploadId || !key || !pathname || !partNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const buffer = await chunk.arrayBuffer()

    const part = await uploadPart(pathname, buffer, {
      access: 'public',
      uploadId,
      key,
      partNumber,
    })

    return NextResponse.json({ etag: part.etag, partNumber: part.partNumber })
  } catch (error) {
    console.error('upload/part error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
