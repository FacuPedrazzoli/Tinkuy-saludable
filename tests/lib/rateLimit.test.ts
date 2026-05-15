import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  checkLoginRateLimit,
  checkApiRateLimit,
  getClientIP,
} from '@/lib/rateLimit'

describe('rateLimit', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('checkLoginRateLimit', () => {
    it('allows first request', () => {
      const result = checkLoginRateLimit('192.168.1.100')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('tracks multiple requests from same IP', () => {
      const ip = '192.168.1.101'
      checkLoginRateLimit(ip)
      checkLoginRateLimit(ip)
      const result = checkLoginRateLimit(ip)
      expect(result.remaining).toBe(2)
    })

    it('blocks when limit exceeded', () => {
      const ip = '192.168.1.102'
      for (let i = 0; i < 5; i++) {
        checkLoginRateLimit(ip)
      }
      const result = checkLoginRateLimit(ip)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('resets after window expires', () => {
      vi.useFakeTimers()
      const ip = '192.168.1.103'

      checkLoginRateLimit(ip)
      const firstBatch = checkLoginRateLimit(ip)
      expect(firstBatch.remaining).toBe(3)

      vi.advanceTimersByTime(15 * 60 * 1000 + 1)

      const afterReset = checkLoginRateLimit(ip)
      expect(afterReset.allowed).toBe(true)
      expect(afterReset.remaining).toBe(4)
    })
  })

  describe('checkApiRateLimit', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('allows first request', () => {
      const result = checkApiRateLimit('192.168.2.100')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(99)
    })

    it('tracks requests correctly', () => {
      const ip = '192.168.2.101'
      const first = checkApiRateLimit(ip)
      expect(first.remaining).toBe(99)

      const second = checkApiRateLimit(ip)
      expect(second.remaining).toBe(98)
    })

    it('blocks when API limit exceeded', () => {
      const ip = '192.168.2.102'
      for (let i = 0; i < 100; i++) {
        checkApiRateLimit(ip)
      }
      const result = checkApiRateLimit(ip)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('resets after API window expires', () => {
      vi.useFakeTimers()
      const ip = '192.168.2.103'

      checkApiRateLimit(ip)
      const beforeReset = checkApiRateLimit(ip)
      expect(beforeReset.remaining).toBe(98)

      vi.advanceTimersByTime(60 * 1000 + 1)

      const afterReset = checkApiRateLimit(ip)
      expect(afterReset.allowed).toBe(true)
      expect(afterReset.remaining).toBe(99)
    })
  })

  describe('getClientIP', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      })
      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('handles single IP in x-forwarded-for', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      })
      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('trims whitespace from IP', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '  192.168.1.1  ' },
      })
      expect(getClientIP(request)).toBe('192.168.1.1')
    })

    it('returns unknown when no x-forwarded-for header', () => {
      const request = new Request('http://localhost')
      expect(getClientIP(request)).toBe('unknown')
    })

    it('handles empty x-forwarded-for', () => {
      const request = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '' },
      })
      expect(getClientIP(request)).toBe('unknown')
    })
  })
})