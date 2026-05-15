import { describe, it, expect } from 'vitest'
import {
  cn,
  formatPrice,
  slugify,
  generateId,
  truncate,
  calculateDiscount,
  formatStock,
  sanitizeHtml,
  escapeJsonString,
  safeJsonStringify,
} from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names', () => {
      const result = cn('foo', 'bar')
      expect(result).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toContain('base')
      expect(result).toContain('active')
    })

    it('merges tailwind classes with conflicting properties', () => {
      const result = cn('px-2 px-4')
      expect(result).toBe('px-4')
    })
  })

  describe('formatPrice', () => {
    it('formats price in ARS', () => {
      const result = formatPrice(1000)
      expect(result).toContain('1.000')
      expect(result).toContain('$')
    })

    it('formats price with decimals', () => {
      const result = formatPrice(1999.99)
      expect(result).toContain('1.999')
    })

    it('formats zero price', () => {
      const result = formatPrice(0)
      expect(result).toContain('0')
      expect(result).toContain('$')
    })
  })

  describe('slugify', () => {
    it('normalizes text to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('removes special characters', () => {
      expect(slugify('foo!bar?baz')).toBe('foobarbaz')
    })

    it('replaces multiple spaces with single hyphen', () => {
      expect(slugify('foo   bar')).toBe('foo-bar')
    })

    it('handles empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('removes accents', () => {
      expect(slugify('café')).toBe('cafe')
    })

    it('handles mixed content', () => {
      expect(slugify('Hello! World?')).toBe('hello-world')
    })
  })

  describe('generateId', () => {
    it('generates id with correct length', () => {
      const id = generateId()
      expect(id.length).toBe(7)
    })

    it('generates unique ids', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()))
      expect(ids.size).toBe(100)
    })
  })

  describe('truncate', () => {
    it('returns original text if shorter than length', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('truncates text at exact length', () => {
      expect(truncate('hello', 5)).toBe('hello')
    })

    it('truncates text longer than length with ellipsis', () => {
      expect(truncate('hello world', 5)).toBe('hello...')
    })

    it('handles empty string', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('calculateDiscount', () => {
    it('calculates normal discount', () => {
      expect(calculateDiscount(100, 75)).toBe(25)
    })

    it('returns 0 when no discount', () => {
      expect(calculateDiscount(100, 100)).toBe(0)
    })

    it('returns 100 for 100% discount', () => {
      expect(calculateDiscount(100, 0)).toBe(100)
    })

    it('rounds discount percentage', () => {
      expect(calculateDiscount(100, 67)).toBe(33)
    })
  })

  describe('formatStock', () => {
    it('formats grams less than 1000', () => {
      expect(formatStock(500)).toBe('500g')
    })

    it('formats exactly 1000 as 1kg', () => {
      expect(formatStock(1000)).toBe('1kg')
    })

    it('formats kilograms', () => {
      expect(formatStock(2500)).toBe('2.5kg')
    })

    it('formats whole kilograms without decimals', () => {
      expect(formatStock(3000)).toBe('3kg')
    })

    it('formats small grams', () => {
      expect(formatStock(1)).toBe('1g')
    })
  })

  describe('sanitizeHtml', () => {
    it('escapes basic HTML characters', () => {
      expect(sanitizeHtml('<div>')).toBe('&lt;div&gt;')
    })

    it('escapes quotes', () => {
      expect(sanitizeHtml('"test"')).toBe('&quot;test&quot;')
    })

    it('blocks XSS attempts', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    })

    it('removes event handlers', () => {
      expect(sanitizeHtml('<img onerror="alert(1)">')).toBe('&lt;img &quot;alert(1)&quot;&gt;')
    })

    it('removes javascript: protocol', () => {
      expect(sanitizeHtml('javascript:alert(1)')).toBe('alert(1)')
    })

    it('handles mixed content', () => {
      expect(sanitizeHtml('<a href="javascript:void(0)">Click</a>')).toBe('&lt;a href=&quot;void(0)&quot;&gt;Click&lt;/a&gt;')
    })
  })

  describe('escapeJsonString', () => {
    it('escapes backslashes', () => {
      expect(escapeJsonString('path\\to\\file')).toBe('path\\\\to\\\\file')
    })

    it('escapes quotes', () => {
      expect(escapeJsonString('say "hello"')).toBe('say \\"hello\\"')
    })

    it('escapes newlines', () => {
      expect(escapeJsonString('line1\nline2')).toBe('line1\\nline2')
    })

    it('escapes tabs', () => {
      expect(escapeJsonString('col1\tcol2')).toBe('col1\\tcol2')
    })

    it('returns empty string for falsy input', () => {
      expect(escapeJsonString('')).toBe('')
      expect(escapeJsonString(null as unknown as string)).toBe('')
    })
  })

  describe('safeJsonStringify', () => {
    it('stringifies string', () => {
      expect(safeJsonStringify('hello')).toBe('"hello"')
    })

    it('stringifies null', () => {
      expect(safeJsonStringify(null)).toBe('null')
    })

    it('stringifies undefined', () => {
      expect(safeJsonStringify(undefined)).toBe('null')
    })

    it('stringifies number', () => {
      expect(safeJsonStringify(42)).toBe('42')
    })

    it('stringifies boolean', () => {
      expect(safeJsonStringify(true)).toBe('true')
    })

    it('stringifies array', () => {
      expect(safeJsonStringify([1, 'two', null])).toBe('[1,"two",null]')
    })

    it('stringifies object', () => {
      const result = safeJsonStringify({ name: 'test', value: 123 })
      expect(result).toBe('{"name":"test","value":123}')
    })

    it('escapes special characters in strings', () => {
      expect(safeJsonStringify('line1\nline2')).toBe('"line1\\nline2"')
    })
  })
})