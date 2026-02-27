import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    BLOB_TOKEN_SET: !!process.env.BLOB_READ_WRITE_TOKEN,
    BLOB_TOKEN_PREFIX: process.env.BLOB_READ_WRITE_TOKEN?.slice(0, 8) ?? 'NOT SET',
    REDIS_URL_SET: !!process.env.UPSTASH_REDIS_REST_URL,
    REDIS_TOKEN_SET: !!process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}
