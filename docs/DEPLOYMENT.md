# Tinkuy Frontend Deployment Checklist

## Prerequisites

- **Node.js**: `>=20.x` (recommended: latest LTS)
- **npm**: `>=10.x` (or yarn/pnpm equivalent)
- **Git**: For version control
- **Access**: Vercel CLI or Vercel account (for Vercel deployments)

Verify your Node.js version:

```bash
node --version
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Production site URL (e.g., `https://your-domain.com`) |
| `NEXT_PUBLIC_GRAPHQL_URL` | Backend GraphQL endpoint URL |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `MERCADOPAGO_PUBLIC_KEY` | MercadoPago public key |
| `MERCADOPAGO_ACCESS_TOKEN` | MercadoPago access token |
| `MERCADOPAGO_WEBHOOK_SECRET` | MercadoPago webhook secret |
| `RESEND_API_KEY` | Resend email API key |
| `EMAIL_FROM` | Default sender email address |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID |
| `NEXT_PUBLIC_PLAUSIBLE_ID` | Plausible analytics domain |

### Security Notes

- Never commit `.env.local` or `.env` to version control
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Server-only variables (like `SUPABASE_SERVICE_ROLE_KEY`) should NOT have the `NEXT_PUBLIC_` prefix

---

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Type Checking

```bash
npm run typecheck
```

### 3. Run Linting

```bash
npm run lint
```

### 4. Run Tests

```bash
npm run test
```

### 5. Build for Production

```bash
npm run build
```

---

## Build Output

After running `npm run build`, Next.js generates:

- `.next/` - Production build directory
- `.next/static/` - Static assets (CSS, JS, images)
- `.next/server/` - Server-side code
- `.nextstandalone/` - Standalone output (if configured)

### Build Artifacts

```
.next/
├── static/          # Public assets
├── server/          # SSR/SSG pages
└── cache/           # Build cache
```

---

## Deployment Targets

### Vercel (Recommended)

1. **Via Git Integration**:
   - Push code to GitHub/GitLab/Bitbucket
   - Import project in Vercel dashboard
   - Configure environment variables in Vercel
   - Deploy automatically on push

2. **Via Vercel CLI**:

   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

3. **Vercel Configuration** (`vercel.json`):
   - Build command: `npm run build`
   - Output directory: `.next`
   - Regions: `gru1` (Sao Paulo)

### Other Platforms

For alternative deployments:

```bash
# Static export (if no SSR features used)
npm run build -- -export

# Docker/Node.js
npm run build
npm start
```

---

## Environment-Specific Configuration

### Development

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

### Staging

```bash
NEXT_PUBLIC_SITE_URL=https://staging.your-domain.com
NEXT_PUBLIC_GRAPHQL_URL=https://staging-api.your-domain.com/graphql
```

### Production

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_GRAPHQL_URL=https://api.your-domain.com/graphql
```

### Image Domains

Configure allowed image domains in `next.config.js`:

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'picsum.photos' },
    { protocol: 'https', hostname: 'tinkuy.supabase.co' },
  ],
}
```

---

## Security Checklist

- [ ] All secrets are in `.env.local`, not committed to git
- [ ] `.env.local` is in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to browser (no `NEXT_PUBLIC_` prefix)
- [ ] MercadoPago tokens stored securely in environment variables
- [ ] API keys for email services (Resend) are server-side only
- [ ] Vercel security headers configured in `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
- [ ] CORS configured on backend for production domain
- [ ] HTTPS enforced on production

### Security Headers (Already Configured)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

---

## Performance Considerations

### Image Optimization

- Next.js Image component automatically optimizes images
- Configure `remotePatterns` for external image sources
- Consider using WebP/AVIF formats

### Bundle Size

- Monitor bundle size with `next build` output
- Use dynamic imports for heavy components
- Enable React Strict Mode in development

### Caching

- Static assets cached via CDN (automatic on Vercel)
- Configure cache headers for API responses on backend

### Build Optimization

```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [...],
  },
}
```

---

## Quick Deploy Commands

```bash
# Full build and check
npm run typecheck && npm run lint && npm run test && npm run build

# Deploy to Vercel production
vercel --prod

# Start production server locally
npm start
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on Vercel | Check Node.js version matches local |
| Environment variables not loading | Verify variables set in Vercel dashboard |
| Images not loading | Check `remotePatterns` in `next.config.js` |
| GraphQL errors | Verify `NEXT_PUBLIC_GRAPHQL_URL` points to production API |
| CORS errors | Configure CORS on backend for production domain |

---

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- Project README.md
