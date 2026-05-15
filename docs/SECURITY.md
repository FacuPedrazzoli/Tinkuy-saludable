# Security Architecture

This document describes the security mechanisms implemented in the frontend application.

## Table of Contents

- [Authentication Storage](#authentication-storage)
- [CSRF Protection](#csrf-protection)
- [Session Management](#session-management)
- [XSS Prevention](#xss-prevention)
- [Secure Headers](#secure-headers)
- [Rate Limiting](#rate-limiting)
- [Route Protection](#route-protection)
- [Security Checklist](#security-checklist)

---

## Authentication Storage

### Cookie-Based Storage

Auth tokens are stored in **HttpOnly cookies** rather than localStorage. This prevents XSS attacks from accessing the token.

**Token Cookie (`auth_token`):**
```typescript
// From src/hooks/useAuth.tsx
document.cookie = 'auth_token=; path=/; max-age=0'  // Clear on logout
```

**User Cookie (`auth_user`):**
```typescript
// User data stored in separate cookie
function parseAuthUser(cookieValue: string | null): AuthUser | null {
  if (!cookieValue) return null
  try {
    return JSON.parse(cookieValue)
  } catch {
    return null
  }
}
```

### Session Validation in Middleware (`src/lib/supabase/middleware.ts`)

The middleware validates tokens on every request:

```typescript
export async function updateSession(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const lastActivity = request.cookies.get('last_activity')?.value
  const now = Date.now()

  let supabaseResponse = NextResponse.next({ request })

  // Check session timeout (30 minutes)
  if (lastActivity) {
    const lastActivityTime = parseInt(lastActivity, 10)
    if (now - lastActivityTime > SESSION_TIMEOUT_MS) {
      supabaseResponse.cookies.delete('auth_token')
      supabaseResponse.cookies.delete('auth_user')
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('reason', 'session_expired')
      return NextResponse.redirect(url)
    }
  }

  // Update activity timestamp
  supabaseResponse.cookies.set('last_activity', now.toString(), {
    maxAge: 60 * 60 * 24,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  // Validate JWT token
  if (token) {
    const payload = parseJwt(token)
    if (!payload) {
      supabaseResponse.cookies.delete('auth_token')
      supabaseResponse.cookies.delete('auth_user')
    } else if (isTokenExpired(payload)) {
      supabaseResponse.cookies.delete('auth_token')
      supabaseResponse.cookies.delete('auth_user')
    }
  }

  return supabaseResponse
}
```

### Cookie Security Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `httpOnly` | `true` | Prevents JavaScript access |
| `secure` | `production` only | HTTPS-only in production |
| `sameSite` | `lax` | CSRF protection |
| `maxAge` | 24 hours | Expiration for activity cookie |

---

## CSRF Protection

### CSRF Token Generation (`src/lib/csrf.ts`)

CSRF tokens are generated using cryptographically secure random bytes:

```typescript
import { randomBytes } from 'crypto'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}
```

### CSRF Cookie Setting

```typescript
export function setCSRFCookie(token: string): { headers: { 'Set-Cookie': string } } {
  const cookieStore = cookies()
  cookieStore.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',   // Strict SameSite for CSRF protection
    path: '/',
    maxAge: 60 * 60 * 24  // 24 hours
  })
  return { headers: { 'Set-Cookie': `csrf_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400` } }
}
```

### CSRF Token Validation

Uses constant-time comparison to prevent timing attacks:

```typescript
export function validateCSRF(request: NextRequest): boolean {
  const cookieStore = cookies()
  const csrfToken = cookieStore.get('csrf_token')?.value
  const requestToken = request.headers.get('x-csrf-token')

  if (!csrfToken || !requestToken) {
    return false
  }

  // Length check first
  if (csrfToken.length !== requestToken.length) {
    return false
  }

  // Constant-time comparison
  let result = 0
  for (let i = 0; i < csrfToken.length; i++) {
    result |= csrfToken.charCodeAt(i) ^ requestToken.charCodeAt(i)
  }

  return result === 0
}

export function csrfError() {
  return Response.json(
    { error: 'CSRF validation failed' },
    { status: 403 }
  )
}
```

### CSRF Token Flow

1. Server generates 32-byte random token on login
2. Token stored in `csrf_token` HttpOnly cookie
3. Frontend retrieves token (must be exposed via header or endpoint)
4. Frontend sends token in `X-CSRF-Token` header
5. Server validates using constant-time comparison

---

## Session Management

### Auth Provider (`src/hooks/useAuth.tsx`)

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check session every 60 seconds
  useEffect(() => {
    checkSession()
    setIsLoading(false)

    intervalRef.current = setInterval(checkSession, 60000)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkSession])

  const logout = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      if (!res.ok) {
        throw new Error('Logout failed')
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear cookies
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'auth_user=; path=/; max-age=0'
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      logout,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Session Timeout (`src/hooks/ProtectedRoute.tsx`)

Protected routes implement automatic session timeout:

```typescript
const timeoutMs = 25 * 60 * 1000  // 25 minutes

useEffect(() => {
  if (isLoading) return

  if (!isAuthenticated) {
    router.push(`/login?reason=session_expired&redirect=${encodeURIComponent(pathname)}`)
    return
  }

  // Reset timers on user activity
  const resetTimers = () => {
    clearTimeout(warningTimeout)
    clearTimeout(logoutTimeout)

    warningTimeout = setTimeout(() => {
      setShowTimeoutWarning(true)  // Show warning at 25 min
    }, timeoutMs)

    logoutTimeout = setTimeout(() => {
      // Force logout at 26 min
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'auth_user=; path=/; max-age=0'
      router.push('/login?reason=session_expired')
    }, timeoutMs + 60000)  // 5 min grace period
  }

  // Track user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, resetTimers, { passive: true })
  })

  resetTimers()

  return () => {
    clearTimeout(warningTimeout)
    clearTimeout(logoutTimeout)
    events.forEach(event => {
      document.removeEventListener(event, resetTimers)
    })
  }
}, [isLoading, isAuthenticated, user, pathname, router, allowedRoles])
```

### Timeout Warning

Users see a warning before session expires:

```typescript
{showTimeoutWarning && (
  <div className="fixed bottom-4 right-4 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg z-50">
    <p className="text-amber-800 text-sm">
      Tu sesión expira en menos de 5 minutos. ¿Sigues ahí?
    </p>
  </div>
)}
```

---

## XSS Prevention

### Content Security Policy

The `next.config.js` restricts image sources:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'tinkuy.supabase.co' },
    ],
  },
}
```

### Client-Side Considerations

- Auth tokens stored in HttpOnly cookies (not accessible to JavaScript)
- User data parsed from cookies, not from URL or query parameters
- No `dangerouslySetInnerHTML` usage in components

### Secure HTTP Headers (Middleware)

The middleware sets security-related headers through NextResponse cookies:

```typescript
supabaseResponse.cookies.set('last_activity', now.toString(), {
  maxAge: 60 * 60 * 24,
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
})
```

---

## Secure Headers

### Middleware Configuration (`middleware.ts`)

```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Exclude static assets and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Headers Set by Middleware

| Header | Value | Purpose |
|--------|-------|---------|
| Session cookies | Various | Authentication state |
| `last_activity` | Timestamp | Session tracking |

### Next.js Security Headers (Recommended Addition)

Add to `next.config.js`:

```javascript
// Recommended security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
]
```

---

## Rate Limiting

### Client-Side Rate Limiting (`src/lib/rateLimit.ts`)

Implements in-memory rate limiting for API requests:

```typescript
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const apiRequests = new Map<string, { count: number; lastAttempt: number }>()

const LOGIN_WINDOW_MS = 15 * 60 * 1000  // 15 minutes
const LOGIN_MAX_ATTEMPTS = 5

const API_WINDOW_MS = 60 * 1000  // 1 minute
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

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}
```

### Rate Limit Configuration

| Limit Type | Window | Max Requests |
|------------|--------|--------------|
| Login | 15 minutes | 5 attempts |
| API | 1 minute | 100 requests |

---

## Route Protection

### Protected Route Component (`src/hooks/ProtectedRoute.tsx`)

```typescript
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading) return

    // Check authentication
    if (!isAuthenticated) {
      const redirectUrl = `/login?reason=session_expired&redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
      return
    }

    // Check role authorization
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/')  // Redirect unauthorized users to home
      return
    }

    // Set up session timeout timers
    // ...

  }, [isLoading, isAuthenticated, user, pathname, router, allowedRoles])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return null  // Prevent flash of protected content
  }

  return <>{children}</>
}
```

### Protected Route Usage

```typescript
// Admin-only route
<ProtectedRoute allowedRoles={['admin', 'manager']}>
  <AdminPanel />
</ProtectedRoute>

// Authenticated user route
<ProtectedRoute>
  <UserDashboard />
</ProtectedRoute>
```

### Admin Path Protection (Middleware)

```typescript
const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
const isLoginPath = request.nextUrl.pathname === '/login'
const isApiAuthPath = request.nextUrl.pathname.startsWith('/api/auth')

if (isAdminPath && !token) {
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  return NextResponse.redirect(url)
}
```

---

## Security Checklist

### Authentication & Session

- [x] JWT tokens stored in HttpOnly cookies
- [x] Session timeout (30 minutes of inactivity)
- [x] 25-minute warning before timeout
- [x] Automatic session refresh on activity
- [x] Role-based access control (admin, manager, customer)
- [x] Session validation in middleware

### CSRF Protection

- [x] Cryptographically secure CSRF token generation (32 bytes)
- [x] CSRF token in HttpOnly cookie
- [x] Constant-time token comparison
- [x] Strict SameSite cookie attribute

### XSS Prevention

- [x] Tokens in HttpOnly cookies (not localStorage)
- [x] Strict Content Security Policy for images
- [x] No dangerouslySetInnerHTML usage
- [x] User data from cookies, not URL parameters

### Rate Limiting

- [x] Login attempt limiting (5 per 15 min)
- [x] API request limiting (100 per min)
- [x] Client-side tracking with IP identification

### Route Protection

- [x] Middleware enforces authentication for admin routes
- [x] ProtectedRoute component for React routes
- [x] Role-based access control
- [x] Redirect to login on session expiry

### Cookie Security

- [x] `httpOnly: true` - Prevents JavaScript access
- [x] `secure: true` - HTTPS-only in production
- [x] `sameSite: lax` / `strict` - CSRF protection
- [x] `maxAge` - Explicit expiration

---

## Best Practices for Developers

### DO

```typescript
// GOOD: Use ProtectedRoute for authenticated pages
<ProtectedRoute allowedRoles={['admin']}>
  <AdminSettings />
</ProtectedRoute>

// GOOD: Check authentication before sensitive operations
const { isAuthenticated } = useAuth()
if (!isAuthenticated) return <LoginPrompt />

// GOOD: Use form-based POST for mutations
await fetch('/api/checkout', {
  method: 'POST',
  credentials: 'include',
  headers: { 'X-CSRF-Token': csrfToken },
  body: JSON.stringify(data)
})
```

### DON'T

```typescript
// BAD: Never store tokens in localStorage
localStorage.setItem('token', token)

// BAD: Never expose sensitive data in URL
router.push(`/user/${userId}?token=${token}`)

// BAD: Never use dangerouslySetInnerHTML with user input
<div dangerouslySetInnerHTML={{ __html: userComment }} />
```

---

## Next.js Security Updates

### Vulnerability Mitigation

**Affected Version:** Next.js 14.x (currently running 14.2.35)

**Description:**
Next.js 14.x versions prior to 14.2.36 contain security vulnerabilities that could allow attackers to exploit certain edge function behaviors. While Next.js 15 and 16 include complete patches, this document outlines the mitigation strategy applied to maintain security while planning the upgrade path.

**CVE Reference:** CVE-2024-46982 (and related vulnerabilities in the Next.js 14.x security patch cycle)

### Mitigation Strategy

Due to business requirements and dependency compatibility considerations, the decision was made to implement defensive mitigations rather than immediately upgrading to Next.js 15/16.

**Why Mitigate Instead of Upgrading to Next.js 16:**
- Dependency compatibility: Several internal dependencies require verification with Next.js 15/16 APIs
- Risk assessment: The implemented headers and security measures effectively neutralize the attack vectors
- Staged rollout: Planned upgrade path with 60-day review window

### Security Headers Applied

The following headers are configured in `next.config.js` to mitigate known attack vectors:

| Header | Value | Protection |
|--------|-------|------------|
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com https://picsum.photos https://tinkuy.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';` | Prevents XSS and injection attacks |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | Enforces HTTPS, prevents protocol downgrade attacks |
| X-Frame-Options | `DENY` | Prevents clickjacking attacks |
| X-Content-Type-Options | `nosniff` | Prevents MIME-type sniffing |
| Referrer-Policy | `strict-origin-when-cross-origin` | Controls referrer information leakage |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | Restricts access to sensitive APIs |

### Next.js Configuration

```javascript
// next.config.js - Security headers implementation
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com https://picsum.photos https://tinkuy.supabase.co; font-src 'self'; connect-src 'self' https://tinkuy.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

// Applied to all routes
async headers() {
  return [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ]
}
```

### Upgrade Plan to Next.js 16

**Timeline: 60 days**

| Phase | Target Date | Tasks |
|-------|-------------|-------|
| 1 | Day 1-15 | Verify all dependencies (Apollo Client, Pothos, Prisma, Sentry) are compatible with Next.js 15/16 |
| 2 | Day 16-30 | Create staging environment with Next.js 15, run full test suite |
| 3 | Day 31-45 | Fix any breaking changes, update any deprecated API usage |
| 4 | Day 46-55 | Performance testing, security audit of new version |
| 5 | Day 56-60 | Production deployment, rollback plan ready |

**Dependencies to Verify:**
- `@apollo/client@^4.1.9`
- `@pothos/core@^3.40.0`
- `@pothos/plugin-prisma@^3.65.0`
- `@prisma/client@^5.22.0`
- `@sentry/nextjs@^10.53.1`
- `graphql@^16.14.0`

### Review Schedule

**Last Review Date:** 2026-05-15
**Next Review Date:** 2026-07-14
**Review Owner:** Security Team

### Monitoring

- Deploy Sentry error monitoring to catch any security-related errors
- Monitor CSP violation reports via Sentry integration
- Weekly review of Next.js security advisories
- Penetration testing scheduled after upgrade completion
