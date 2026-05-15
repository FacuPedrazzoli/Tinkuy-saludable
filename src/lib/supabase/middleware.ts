import { NextResponse, type NextRequest } from 'next/server'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000

function parseJwt(token: string): { exp: number; iat: number; [key: string]: unknown } | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

function isTokenExpired(payload: { exp: number }): boolean {
  return Date.now() >= payload.exp * 1000
}

function shouldRefreshToken(payload: { exp: number }): boolean {
  const expiresInMs = payload.exp * 1000 - Date.now()
  return expiresInMs < TOKEN_REFRESH_THRESHOLD_MS && expiresInMs > 0
}

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const lastActivity = request.cookies.get('last_activity')?.value
  const now = Date.now()

  let supabaseResponse = NextResponse.next({ request })

  if (lastActivity) {
    const lastActivityTime = parseInt(lastActivity, 10)
    if (now - lastActivityTime > SESSION_TIMEOUT_MS) {
      supabaseResponse = NextResponse.next({ request })
      supabaseResponse.cookies.delete('auth_token')
      supabaseResponse.cookies.delete('last_activity')
      supabaseResponse.cookies.delete('auth_user')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('reason', 'session_expired')
      return NextResponse.redirect(url)
    }
  }

  supabaseResponse.cookies.set('last_activity', now.toString(), {
    maxAge: 60 * 60 * 24,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = request.nextUrl.pathname === '/login'
  const isApiAuthPath = request.nextUrl.pathname.startsWith('/api/auth')

  if (isAdminPath && !token) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (token) {
    const payload = parseJwt(token)
    if (!payload) {
      supabaseResponse.cookies.delete('auth_token')
      supabaseResponse.cookies.delete('auth_user')
      if (isAdminPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    } else if (isTokenExpired(payload)) {
      supabaseResponse.cookies.delete('auth_token')
      supabaseResponse.cookies.delete('auth_user')
      if (isAdminPath && !isApiAuthPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('reason', 'token_expired')
        return NextResponse.redirect(url)
      }
    } else if (isLoginPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
