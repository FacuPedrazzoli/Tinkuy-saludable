const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const apiRequests = new Map<string, { count: number; lastAttempt: number }>()

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5

const API_WINDOW_MS = 60 * 1000
const API_MAX_REQUESTS = 100

export function checkLoginRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  if (!record || now - record.lastAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: LOGIN_MAX_ATTEMPTS - 1, resetIn: LOGIN_WINDOW_MS }
  }

  if (record.count >= LOGIN_MAX_ATTEMPTS) {
    const resetIn = LOGIN_WINDOW_MS - (now - record.lastAttempt)
    return { allowed: false, remaining: 0, resetIn }
  }

  record.count++
  record.lastAttempt = now
  return { allowed: true, remaining: LOGIN_MAX_ATTEMPTS - record.count, resetIn: LOGIN_WINDOW_MS }
}

export function checkApiRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const record = apiRequests.get(ip)

  if (!record || now - record.lastAttempt > API_WINDOW_MS) {
    apiRequests.set(ip, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: API_MAX_REQUESTS - 1, resetIn: API_WINDOW_MS }
  }

  if (record.count >= API_MAX_REQUESTS) {
    const resetIn = API_WINDOW_MS - (now - record.lastAttempt)
    return { allowed: false, remaining: 0, resetIn }
  }

  record.count++
  record.lastAttempt = now
  return { allowed: true, remaining: API_MAX_REQUESTS - record.count, resetIn: API_WINDOW_MS }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}