import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { LOCALE, CURRENCY } from '@/lib/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 0,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function getImagePlaceholder(width: number, height: number): string {
  return `https://picsum.photos/${width}/${height}`
}

export function calculateDiscount(original: number, current: number): number {
  return Math.round(((original - current) / original) * 100)
}

export function formatStock(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000
    return kg % 1 === 0 ? `${kg}kg` : `${kg.toFixed(1)}kg`
  }
  return `${grams}g`
}

export function sanitizeHtml(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

export function escapeJsonString(str: string): string {
  if (!str) return ''
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

export function safeJsonStringify(obj: unknown): string {
  if (typeof obj === 'string') {
    return `"${escapeJsonString(obj)}"`
  }
  if (obj === null || obj === undefined) {
    return 'null'
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj)
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(safeJsonStringify).join(',')}]`
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    const escaped = entries.map(([k, v]) => `"${escapeJsonString(k)}":${safeJsonStringify(v)}`)
    return `{${escaped.join(',')}}`
  }
  return '""'
}