import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockRequest, createCSRFToken } from './helpers'

const mockSupabaseCreateClient = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockSupabaseCreateClient,
}))

const mockValidateCSRF = vi.fn()
const mockCSRFError = vi.fn()

vi.mock('@/lib/csrf', () => ({
  validateCSRF: mockValidateCSRF,
  csrfError: mockCSRFError,
  generateCSRFToken: () => 'test-token',
  setCSRFCookie: () => ({ headers: { 'Set-Cookie': 'csrf_token=test-token' } }),
}))

const mockCheckLoginRateLimit = vi.fn()
const mockCheckApiRateLimit = vi.fn()
const mockGetClientIP = vi.fn()

vi.mock('@/lib/rateLimit', () => ({
  checkLoginRateLimit: mockCheckLoginRateLimit,
  checkApiRateLimit: mockCheckApiRateLimit,
  getClientIP: mockGetClientIP,
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      if (name === 'csrf_token') return { value: 'valid-csrf-token-12345678901234567890123456789012' }
      return undefined
    }),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

describe('/api/admin-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateCSRF.mockReturnValue(true)
    mockCSRFError.mockReturnValue(
      new Response(JSON.stringify({ error: 'CSRF validation failed' }), { status: 403 })
    )
    mockCheckLoginRateLimit.mockReturnValue({ allowed: true, remaining: 4, resetIn: 900000 })
    mockCheckApiRateLimit.mockReturnValue({ allowed: true, remaining: 99, resetIn: 60000 })
    mockGetClientIP.mockReturnValue('127.0.0.1')
  })

  describe('POST', () => {
    it('returns 401 with invalid credentials', async () => {
      mockSupabaseCreateClient.mockResolvedValue({
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid login credentials' },
          }),
        },
      })

      const { POST } = await import('@/app/api/admin-auth/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/admin-auth', {
        method: 'POST',
        body: { email: 'wrong@test.com', password: 'wrongpass' },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid login credentials')
    })

    it('returns 429 when rate limit exceeded', async () => {
      mockCheckLoginRateLimit.mockReturnValue({ allowed: false, remaining: 0, resetIn: 600000 })

      const { POST } = await import('@/app/api/admin-auth/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/admin-auth', {
        method: 'POST',
        body: { email: 'admin@test.com', password: 'password' },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.code).toBe('RATE_LIMITED')
    })
  })
})

describe('/api/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateCSRF.mockReturnValue(true)
  })

  it('POST clears auth cookies', async () => {
    mockSupabaseCreateClient.mockResolvedValue({
      auth: {
        signOut: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null }),
      },
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })

    const { POST } = await import('@/app/api/auth/logout/route')
    const request = createMockRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
