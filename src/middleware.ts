import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_NAME, verifySessionToken } from '@/lib/auth'

/** Methods that change state and therefore always require a session. */
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // The login page and its endpoints must stay reachable while signed out.
  if (pathname === '/admin/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  const isApi = pathname.startsWith('/api/')

  // Reading the episode list is public — the site itself renders from it.
  // Creating, editing and deleting are not.
  if (pathname.startsWith('/api/episodes') && !MUTATING_METHODS.has(request.method)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value ?? ''
  if (await verifySessionToken(token)) {
    return NextResponse.next()
  }

  // An API caller wants a status code, not a redirect to an HTML login page.
  if (isApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: [
    '/admin/:path*',
    // Blob upload tokens are billable; minting one requires a session.
    '/api/upload',
    '/api/episodes/:path*',
    '/api/episodes',
  ],
}
