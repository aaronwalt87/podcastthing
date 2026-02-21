import { handleUpload, type HandleUploadBody } from '@vercel/blob/multipart'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Only allow audio file types
        const audioExtensions = ['.mp3', '.m4a', '.ogg', '.wav', '.aac', '.flac']
        const ext = pathname.toLowerCase().slice(pathname.lastIndexOf('.'))

        if (!audioExtensions.includes(ext)) {
          throw new Error(`File type not allowed. Allowed: ${audioExtensions.join(', ')}`)
        }

        return {
          allowedContentTypes: [
            'audio/mpeg',
            'audio/mp4',
            'audio/ogg',
            'audio/wav',
            'audio/aac',
            'audio/flac',
            'audio/x-flac',
            'audio/x-m4a',
          ],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200 MB
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // Note: This callback won't fire in local dev without a public URL.
        // Episode is saved from the client side after upload() resolves.
        console.log('Upload completed:', blob.url)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
