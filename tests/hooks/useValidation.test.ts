import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateMinLength,
  createValidator,
  validationRules,
} from '@/hooks/useValidation'

describe('useValidation', () => {
  describe('validateEmail', () => {
    it('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co')).toBe(true)
      expect(validateEmail('user+tag@domain.org')).toBe(true)
    })

    it('returns false for email without @', () => {
      expect(validateEmail('testexample.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })

    it('returns false for email without domain', () => {
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('test@domain')).toBe(false)
    })

    it('returns false for email with spaces', () => {
      expect(validateEmail('test @example.com')).toBe(false)
      expect(validateEmail('test@ example.com')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('returns true for valid phone with 8+ digits', () => {
      expect(validatePhone('12345678')).toBe(true)
      expect(validatePhone('1234567890')).toBe(true)
      expect(validatePhone('+54 11 1234 5678')).toBe(true)
      expect(validatePhone('(123) 456-7890')).toBe(true)
    })

    it('returns false for phone that is too short', () => {
      expect(validatePhone('1234567')).toBe(false)
      expect(validatePhone('123456')).toBe(false)
      expect(validatePhone('12345')).toBe(false)
    })

    it('returns false for phone with only 7 digits', () => {
      expect(validatePhone('1234567')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(validatePhone('')).toBe(false)
    })

    it('ignores non-digit characters for length check', () => {
      expect(validatePhone('(123) 456-78')).toBe(true)
      expect(validatePhone('(123) 456-789')).toBe(true)
    })
  })

  describe('validateRequired', () => {
    it('returns false for empty string', () => {
      expect(validateRequired('')).toBe(false)
    })

    it('returns false for string with only spaces', () => {
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired('\t\n')).toBe(false)
    })

    it('returns true for valid non-empty string', () => {
      expect(validateRequired('hello')).toBe(true)
      expect(validateRequired('  hello  ')).toBe(true)
      expect(validateRequired('a')).toBe(true)
    })

    it('returns true for string with leading/trailing spaces but content', () => {
      expect(validateRequired('  hello world  ')).toBe(true)
    })
  })

  describe('validateMinLength', () => {
    it('returns true when length equals minimum', () => {
      expect(validateMinLength('hello', 5)).toBe(true)
      expect(validateMinLength('ab', 2)).toBe(true)
    })

    it('returns true when length is greater than minimum', () => {
      expect(validateMinLength('hello world', 5)).toBe(true)
      expect(validateMinLength('abc', 2)).toBe(true)
    })

    it('returns false when length is less than minimum', () => {
      expect(validateMinLength('hi', 5)).toBe(false)
      expect(validateMinLength('a', 2)).toBe(false)
    })

    it('returns false for string with only spaces below minimum', () => {
      expect(validateMinLength('   ', 4)).toBe(false)
    })

    it('ignores leading/trailing spaces in length calculation', () => {
      expect(validateMinLength('  hi  ', 4)).toBe(false)
      expect(validateMinLength('  hello  ', 5)).toBe(true)
    })

    it('returns true for empty string when minLength is 0', () => {
      expect(validateMinLength('', 0)).toBe(true)
    })
  })

  describe('createValidator', () => {
    it('creates a validator function', () => {
      const validator = createValidator({
        name: [
          { validate: (v: string) => v.length > 0, message: 'Required' },
          { validate: (v: string) => v.length >= 2, message: 'Too short' },
        ],
      })

      expect(typeof validator).toBe('function')
    })

    it('returns null when field has no validation errors', () => {
      const validator = createValidator({
        name: [
          { validate: (v: string) => v.length > 0, message: 'Required' },
          { validate: (v: string) => v.length >= 2, message: 'Too short' },
        ],
      })

      expect(validator('name', 'John')).toBeNull()
      expect(validator('name', 'Jo')).toBeNull()
    })

    it('returns error message when validation fails', () => {
      const validator = createValidator({
        name: [
          { validate: (v: string) => v.length > 0, message: 'Required' },
          { validate: (v: string) => v.length >= 2, message: 'Too short' },
        ],
      })

      expect(validator('name', '')).toBe('Required')
      expect(validator('name', 'a')).toBe('Too short')
    })

    it('returns first error message when multiple validations fail', () => {
      const validator = createValidator({
        name: [
          { validate: (v: string) => v.length > 0, message: 'Required' },
          { validate: (v: string) => v.length >= 2, message: 'Too short' },
        ],
      })

      expect(validator('name', '')).toBe('Required')
    })

    it('returns null for unknown field', () => {
      const validator = createValidator({
        name: [{ validate: (v: string) => v.length > 0, message: 'Required' }],
      })

      expect(validator('unknown', 'value')).toBeNull()
    })

    it('works with multiple fields', () => {
      const validator = createValidator({
        email: [
          { validate: (v: string) => v.length > 0, message: 'Email required' },
          { validate: (v: string) => v.includes('@'), message: 'Invalid email' },
        ],
        phone: [
          { validate: (v: string) => v.length >= 8, message: 'Phone too short' },
        ],
      })

      expect(validator('email', 'test@example.com')).toBeNull()
      expect(validator('email', 'invalid')).toBe('Invalid email')
      expect(validator('phone', '12345678')).toBeNull()
      expect(validator('phone', '123')).toBe('Phone too short')
    })

    it('handles generic type parameter', () => {
      const validator = createValidator<string>({
        field: [{ validate: (v: string) => v === 'valid', message: 'Not valid' }],
      })

      expect(validator('field', 'valid')).toBeNull()
      expect(validator('field', 'invalid')).toBe('Not valid')
    })
  })

  describe('validationRules', () => {
    it('has name rules', () => {
      expect(validationRules.name).toBeDefined()
      expect(validationRules.name.length).toBe(2)
    })

    it('has email rules', () => {
      expect(validationRules.email).toBeDefined()
      expect(validationRules.email.length).toBe(2)
    })

    it('has phone rules', () => {
      expect(validationRules.phone).toBeDefined()
      expect(validationRules.phone.length).toBe(2)
    })

    it('has message rules', () => {
      expect(validationRules.message).toBeDefined()
      expect(validationRules.message.length).toBe(2)
    })

    it('validates name correctly with validationRules', () => {
      const validator = createValidator(validationRules)

      expect(validator('name', '')).toBe('El nombre es requerido')
      expect(validator('name', 'a')).toBe('El nombre debe tener al menos 2 caracteres')
      expect(validator('name', 'Jo')).toBeNull()
      expect(validator('name', 'John')).toBeNull()
    })

    it('validates email correctly with validationRules', () => {
      const validator = createValidator(validationRules)

      expect(validator('email', '')).toBe('El email es requerido')
      expect(validator('email', 'invalid')).toBe('Ingresá un email válido')
      expect(validator('email', 'test@example.com')).toBeNull()
    })

    it('validates phone correctly with validationRules', () => {
      const validator = createValidator(validationRules)

      expect(validator('phone', '')).toBe('El teléfono es requerido')
      expect(validator('phone', '1234567')).toBe('Ingresá un teléfono válido')
      expect(validator('phone', '12345678')).toBeNull()
    })

    it('validates message correctly with validationRules', () => {
      const validator = createValidator(validationRules)

      expect(validator('message', '')).toBe('El mensaje es requerido')
      expect(validator('message', 'short')).toBe('El mensaje debe tener al menos 10 caracteres')
      expect(validator('message', 'This is a long message')).toBeNull()
    })
  })
})
