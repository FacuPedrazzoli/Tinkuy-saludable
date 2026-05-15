import { describe, it, expect } from 'vitest'
import { generateCSRFToken, csrfError } from '@/lib/csrf'

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}))

describe('csrf', () => {
  describe('generateCSRFToken', () => {
    it('generates token with correct length', () => {
      const token = generateCSRFToken()
      expect(token.length).toBe(64)
    })

    it('generates token as hex string', () => {
      const token = generateCSRFToken()
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('generates unique tokens', () => {
      const tokens = new Set(Array.from({ length: 100 }, () => generateCSRFToken()))
      expect(tokens.size).toBe(100)
    })
  })

  describe('csrfError', () => {
    it('returns 403 status', () => {
      const response = csrfError()
      expect(response.status).toBe(403)
    })

    it('returns correct error body', async () => {
      const response = csrfError()
      const body = await response.json()
      expect(body).toEqual({ error: 'CSRF validation failed' })
    })
  })
})