# Troubleshooting Guide - tinkuy

A comprehensive guide for debugging common issues in the Next.js frontend.

## Table of Contents

- [Getting Started](#getting-started)
- [Debug Logging](#debug-logging)
- [Authentication Issues](#authentication-issues)
- [GraphQL Client Errors](#graphql-client-errors)
- [Supabase Integration](#supabase-integration)
- [Image/Asset Issues](#imageasset-issues)
- [Build and Deployment](#build-and-deployment)
- [Test Failures](#test-failures)

---

## Getting Started

### Where to Check Logs

**Browser Console**
Open DevTools (`F12`) > Console tab for:
- React rendering errors
- GraphQL query failures
- Supabase client errors
- State management issues

**Network Tab**
DevTools > Network tab for:
- Failed API requests
- WebSocket issues
- GraphQL operations and responses

**Server Logs (Production)**
For Vercel deployments:
```bash
vercel logs your-project
```

### Key Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Debug Logging

### Enable Verbose Mode

```bash
# Development with debug output
npm run dev

# Check for warnings in console
# Look for [GraphQL] or [Apollo] tags
```

### GraphQL Debugging

Enable Apollo Client logging:
```typescript
// In Apollo Client config (src/lib/graphql/client.ts)
const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
});
```

Check all GraphQL operations at `/graphql` endpoint of backend.

### Supabase Debugging

Enable Supabase debug mode:
```typescript
// In your Supabase client
const supabase = createClient(url, key, {
  realtime: { logger: console.log }
})
```

---

## Authentication Issues

### Session Expired Redirects to /login

**Symptom:** Being redirected to `/login?reason=session_expired`

**Cause:** Session timeout (30 minutes of inactivity)

**Solution:** Re-authenticate. The middleware automatically clears expired sessions.

### Token Expired

**Symptom:** Redirect to `/login?reason=token_expired`

**Cause:** JWT token passed its expiration time

**Solution:** Clear cookies and re-login

**Check token manually:**
1. Open DevTools > Application > Cookies
2. Find `auth_token`
3. Decode at [jwt.io](https://jwt.io)
4. Check `exp` claim (expiration timestamp)

### Invalid Token Format

**Symptom:** Redirect to `/login` immediately after login

**Cause:** Cookie corruption or tampering

**Solution:**
```javascript
// Clear all cookies in browser DevTools
// Or in browser console:
document.cookie.split(";").forEach(c => document.cookie = c.trim().split("=")[0] + "=;expires=" + new Date().toUTCString() + ";path=/")
```

### Admin Path Access Denied

**Symptom:** Redirect to `/login` when accessing `/admin/*`

**Cause:** No `auth_token` cookie present

**Solution:** Ensure login sets the `auth_token` cookie with valid JWT

### Supabase Session Issues

**Symptom:** Auth state inconsistent

**Causes:**
1. Server-side rendering accessing browser cookies
2. Supabase client not configured for SSR
3. Cookie not passed to server

**Solution:** Use `@supabase/ssr` for server components:
```typescript
import { createBrowserClient } from '@supabase/ssr'
// NOT createClient
```

---

## GraphQL Client Errors

### "Network Error: Failed to fetch"

**Causes:**
1. Backend server not running
2. CORS blocking request
3. Wrong `NEXT_PUBLIC_GRAPHQL_URL`
4. Backend returning non-JSON

**Solutions:**

1. Verify backend is running:
```bash
curl http://localhost:4000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

2. Check CORS config in backend (`src/index.ts`):
```typescript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
})
```

3. Verify URL in `.env.local`:
```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### GraphQL Validation Errors

**Error format:**
```json
{
  "errors": [
    {
      "message": "Field 'xyz' not found on type 'Query'",
      "extensions": { "code": "GRAPHQL_VALIDATION_FAILED" }
    }
  ]
}
```

**Causes:**
1. Backend schema updated but frontend not rebuilt
2. Typo in query/mutation name
3. Missing required arguments

**Solution:**
```bash
# Restart dev server to pick up schema changes
npm run dev
```

### Apollo Client Cache Issues

**Symptom:** Stale data after mutations

**Solution:** Force refetch after mutations:
```typescript
const [submitMutation] = useMutation(MUTATION, {
  refetchQueries: [{ query: QUERY }],
  awaitRefetchQueries: true,
})
```

Or invalidate specific cache:
```typescript
client.cache.invalidateQueries({ query: QUERY })
```

### Authentication Required Errors

**Error:** `Authentication required` from GraphQL

**Cause:** Request missing Authorization header

**Solution:** Ensure Apollo Client link adds auth header:
```typescript
const authLink = setContext((_, { headers }) => {
  const token = getAuthToken() // from cookie or state
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})
```

---

## Supabase Integration

### Supabase Client Not Initializing

**Error:** `SupabaseClient is not defined` or similar

**Solution:** Use `@supabase/ssr` for Next.js App Router:
```typescript
// middleware.ts - already configured
import { updateSession } from '@/lib/supabase/middleware'

// For client components
import { createBrowserClient } from '@supabase/ssr'
```

### Realtime Not Working

**Causes:**
1. Realtime disabled in Supabase dashboard
2. Missing `realtime` scope in client
3. Not subscribed to correct channels

**Solution:**
1. Enable Realtime in Supabase Dashboard > Database > Replication
2. Check client setup:
```typescript
const supabase = createClient(url, key, {
  realtime: {
    params: { eventsPerHour: 10000 }
  }
})
```

### Row Level Security (RLS) Errors

**Error:** `Permission denied` or `401`

**Cause:** User not authenticated or lacks permissions

**Solution:**
1. Check user session exists
2. Verify RLS policies in Supabase dashboard
3. Test in Supabase SQL Editor:
```sql
-- Check current user's permissions
SELECT * FROM auth.jwts();
```

---

## Image/Asset Issues

### Images Not Loading

**Causes:**
1. Image optimization not configured
2. Wrong image domains in `next.config.js`
3. External URL blocked

**Solution:** Check `next.config.js`:
```javascript
images: {
  domains: ['your-cdn.com', 'your-storage.com'],
  remotePatterns: [{ protocol: 'https', hostname: '**.domain.com' }],
}
```

### Image Compression Issues

**Error:** `sharp` module errors

**Cause:** Optional dependency not installed

**Solution:**
```bash
npm install sharp
```

### Static Images 404

**Cause:** Using incorrect path

**Solution:**
```typescript
// Correct - for files in public/
import Image from 'next/image'
<Image src="/logo.png" width={100} height={100} />

// If file is in public/ folder
// URL should be: /logo.png
```

---

## Build and Deployment

### Build Failures

**Common Causes:**

1. **TypeScript errors**
```bash
npm run typecheck
# Fix any errors before building
```

2. **Missing environment variables**
```bash
# Check ALL required NEXT_PUBLIC_ variables are set
grep -r "NEXT_PUBLIC_" .env.local
```

3. **Dependency issues**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Vercel Deployment Issues

**Checklist:**
- [ ] All `NEXT_PUBLIC_` vars set in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next` (default)
- [ ] Node version: 18.x or higher

**View deployment logs:**
```bash
vercel logs your-project --follow
```

### Middleware Not Running

**Symptom:** Session checks not working

**Cause:** `middleware.ts` not at project root

**Solution:** Ensure `middleware.ts` is in project root:
```
tinkuy/
├── middleware.ts      # HERE
├── src/
├── package.json
└── next.config.js
```

### CORS Errors After Deployment

**Symptom:** Works locally but fails in production

**Cause:** Backend `FRONTEND_URL` doesn't match production URL

**Solution:** Update backend's `FRONTEND_URL` to exact production origin:
```
FRONTEND_URL=https://your-frontend.vercel.app
# Must include protocol and exact domain
```

---

## Test Failures

### Test Setup

Tests require:
- Node environment with mocked Next.js modules
- Mocked Zustand stores
- Mocked Supabase client

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npx vitest run --coverage
```

### "Cannot find module 'next/navigation'"

**Cause:** Next.js module mocks not loaded

**Solution:** Verify `tests/setup.ts` imports testing library:
```typescript
import '@testing-library/jest-dom'
```

### React Hook Form Mocks

**Error:** `useForm` is not defined

**Solution:** Already mocked in `tests/setup.ts`:
```typescript
// Mocks react-hook-form automatically
// Uses @hookform/resolvers
```

### Store State Issues

**Error:** `Cannot read property 'xyz' of undefined`

**Cause:** Zustand store mock not returning proper shape

**Solution:** Check `tests/setup.ts` mocks:
```typescript
vi.mock('@/lib/store', () => {
  return {
    useCartStore: vi.fn(() => state),
    // ...
  }
})
```

### Testing Library Errors

**Error:** `Unable to find role`

**Solution:** Use correct queries:
```typescript
// Instead of getByText for buttons
screen.getByRole('button', { name: /submit/i })

// For form fields
screen.getByRole('textbox', { name: /email/i })
screen.getByLabelText(/password/i)
```

### Cleanup Between Tests

If tests share state:
```typescript
beforeEach(() => {
  vi.clearAllMocks()
  // Reset store state if needed
})
```

### Mock Fetch Calls

**Error:** `fetch mock not called` or unexpected fetch

**Solution:** Use `vi.fn()` for fetch in `tests/setup.ts`:
```typescript
global.fetch = vi.fn()
```

Reset per test:
```typescript
beforeEach(() => {
  global.fetch = vi.fn()
})
```

---

## Common Issues Quick Reference

| Problem | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Blank page | Build error | Run `npm run build` locally |
| Login redirect loop | Cookie middleware | Check `middleware.ts` logic |
| Stale data | Apollo cache | Hard refresh (`Cmd+Shift+R`) |
| GraphQL errors | Backend schema drift | Restart backend dev server |
| Images 404 | Wrong path | Use `/` for public folder |
| Slow build | Too many images | Compress images before adding |
| Auth state lost | SSR cookie access | Use `@supabase/ssr` |
| Tests flaky | Shared state | Add `beforeEach` cleanup |

---

## Getting Help

When reporting issues, include:
1. Browser and version
2. Error message and screenshot
3. Steps to reproduce
4. Contents of `.env.local` (redact secrets)
5. Output of `npm run typecheck`
6. Output of `npm run build`
