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

describe('/api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateCSRF.mockReturnValue(true)
    mockCSRFError.mockReturnValue(
      new Response(JSON.stringify({ error: 'CSRF validation failed' }), { status: 403 })
    )
  })

  describe('POST', () => {
    it('returns 403 without CSRF token', async () => {
      mockValidateCSRF.mockReturnValue(false)

      const { POST } = await import('@/app/api/contact/route')
      const request = createMockRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: {
          name: 'Test',
          email: 'test@example.com',
          message: 'Hello',
        },
      })

      const response = await POST(request)

      expect(response.status).toBe(403)
    })

    it('returns 400 with missing required fields', async () => {
      mockSupabaseCreateClient.mockResolvedValue({
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })

      const { POST } = await import('@/app/api/contact/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: {
          name: 'Test',
        },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('returns 200 with valid data', async () => {
      mockSupabaseCreateClient.mockResolvedValue({
        from: vi.fn().mockReturnThis(),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })

      const { POST } = await import('@/app/api/contact/route')
      const csrfToken = createCSRFToken()
      const request = createMockRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '123456789',
          message: 'Hello, this is a test message',
        },
        cookies: { csrf_token: csrfToken },
        headers: { 'x-csrf-token': csrfToken },
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })
})
