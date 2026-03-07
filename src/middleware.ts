export const runtime = 'nodejs'

import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_NAME, isValidToken } from '@/lib/auth'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login page is always accessible
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value ?? ''

  if (!isValidToken(token)) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
