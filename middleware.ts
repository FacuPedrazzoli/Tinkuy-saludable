import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ROUTES = ['/admin']
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route))
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  const graphqlToken = request.cookies.get('graphql_token')?.value
  const isAuthenticated = !!graphqlToken

  if (isAdminRoute && !isAuthenticated && !pathname.startsWith('/admin/login')) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isPublicRoute && isAuthenticated && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/perfil/:path*',
    '/wishlist/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password/:path*',
  ],
}
