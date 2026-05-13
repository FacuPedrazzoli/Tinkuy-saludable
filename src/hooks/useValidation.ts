export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length >= 8
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength
}

export interface ValidationRule<T = string> {
  validate: (value: T) => boolean
  message: string
}

export function createValidator<T extends string>(
  rules: Record<string, ValidationRule[]>
) {
  return (fieldName: string, value: T): string | null => {
    const fieldRules = rules[fieldName]
    if (!fieldRules) return null

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        return rule.message
      }
    }

    return null
  }
}

export const validationRules = {
  name: [
    { validate: (v: string) => validateRequired(v), message: 'El nombre es requerido' },
    { validate: (v: string) => validateMinLength(v, 2), message: 'El nombre debe tener al menos 2 caracteres' },
  ],
  email: [
    { validate: (v: string) => validateRequired(v), message: 'El email es requerido' },
    { validate: (v: string) => validateEmail(v), message: 'Ingresá un email válido' },
  ],
  phone: [
    { validate: (v: string) => validateRequired(v), message: 'El teléfono es requerido' },
    { validate: (v: string) => validatePhone(v), message: 'Ingresá un teléfono válido' },
  ],
  message: [
    { validate: (v: string) => validateRequired(v), message: 'El mensaje es requerido' },
    { validate: (v: string) => validateMinLength(v, 10), message: 'El mensaje debe tener al menos 10 caracteres' },
  ],
  address: [
    { validate: (v: string) => validateRequired(v), message: 'La dirección es requerida' },
  ],
  city: [
    { validate: (v: string) => validateRequired(v), message: 'La ciudad es requerida' },
  ],
  postalCode: [
    { validate: (v: string) => validateRequired(v), message: 'El código postal es requerido' },
  ],
}