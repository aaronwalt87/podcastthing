import { NextResponse } from 'next/server'
import { createMultipartUpload } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { filename } = await request.json()

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'filename is required' }, { status: 400 })
    }

    const result = await createMultipartUpload(filename, { access: 'public' })

    return NextResponse.json({
      uploadId: result.uploadId,
      key: result.key,
    })
  } catch (error) {
    console.error('upload/init error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
