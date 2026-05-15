import { NextRequest } from 'next/server'

export function createMockRequest(
  url: string,
  options: {
    method?: string
    body?: Record<string, unknown> | null
    headers?: Record<string, string>
    cookies?: Record<string, string>
  } = {}
): NextRequest {
  const { method = 'GET', body = null, headers = {}, cookies = {} } = options

  const cookieString = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')

  const mergedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (cookieString) {
    mergedHeaders['Cookie'] = cookieString
  }

  const init: RequestInit = {
    method,
    headers: mergedHeaders,
  }

  if (body !== null) {
    init.body = JSON.stringify(body)
  }

  return new NextRequest(url, init)
}

export function createCSRFToken(): string {
  return 'valid-csrf-token-12345678901234567890123456789012'
}
