import { NextRequest } from 'next/server'

export function validateCSRF(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'https://tinkuy.com',
  ].filter(Boolean)

  if (origin && allowedOrigins.includes(origin)) {
    return true
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer)
      if (allowedOrigins.includes(refererUrl.origin)) {
        return true
      }
    } catch {
      return false
    }
  }

  return false
}

export function csrfError() {
  return Response.json(
    { error: 'CSRF validation failed' },
    { status: 403 }
  )
}