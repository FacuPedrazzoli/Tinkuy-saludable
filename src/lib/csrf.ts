import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export function setCSRFCookie(token: string): { headers: { 'Set-Cookie': string } } {
  const cookieStore = cookies()
  cookieStore.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24
  })
  return { headers: { 'Set-Cookie': `csrf_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400` } }
}

export function validateCSRF(request: NextRequest): boolean {
  const cookieStore = cookies()
  const csrfToken = cookieStore.get('csrf_token')?.value
  const requestToken = request.headers.get('x-csrf-token')

  if (!csrfToken || !requestToken) {
    return false
  }

  if (csrfToken.length !== requestToken.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < csrfToken.length; i++) {
    result |= csrfToken.charCodeAt(i) ^ requestToken.charCodeAt(i)
  }

  return result === 0
}

export function csrfError() {
  return Response.json(
    { error: 'CSRF validation failed' },
    { status: 403 }
  )
}
