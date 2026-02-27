import { NextResponse } from 'next/server'
import { completeMultipartUpload } from '@vercel/blob'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { uploadId, key, pathname, parts } = await request.json()

    if (!uploadId || !key || !pathname || !parts) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const blob = await completeMultipartUpload(pathname, parts, {
      access: 'public',
      uploadId,
      key,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('upload/complete error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
