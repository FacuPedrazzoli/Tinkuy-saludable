const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now - record.lastAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const resetIn = WINDOW_MS - (now - record.lastAttempt)
    return { allowed: false, remaining: 0, resetIn }
  }

  record.count++
  record.lastAttempt = now
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count, resetIn: WINDOW_MS }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}