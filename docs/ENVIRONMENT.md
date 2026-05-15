# Environment Variables

This document lists all environment variables used in the Tinkuy frontend.

## Table

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` | Base URL of the frontend site. Used for generating absolute URLs in SEO metadata, sitemaps, and robots.txt. |
| `NEXT_PUBLIC_GRAPHQL_URL` | Yes | `http://localhost:4000/graphql` | GraphQL backend endpoint (Back-Tinkuy-Saludable). All API queries go through this URL. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | - | Supabase project URL. When set, enables Supabase integration for catalog products. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | - | Supabase anonymous key. Paired with `NEXT_PUBLIC_SUPABASE_URL` to enable Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | - | Supabase service role key. Server-side only, used for admin operations. |
| `MERCADOPAGO_PUBLIC_KEY` | No | - | MercadoPago public key for payment integration. |
| `MERCADOPAGO_ACCESS_TOKEN` | No | - | MercadoPago access token. Server-side only, for API operations. |
| `MERCADOPAGO_WEBHOOK_SECRET` | No | - | MercadoPago webhook verification secret. |
| `RESEND_API_KEY` | No | - | Resend API key for transactional email sending. |
| `EMAIL_FROM` | No | `noreply@tutienda.com` | Default sender address for emails. |
| `NEXT_PUBLIC_GA_ID` | No | - | Google Analytics 4 measurement ID (e.g., `G-XXXXXXXXXX`). |
| `NEXT_PUBLIC_PLAUSIBLE_ID` | No | - | Plausible Analytics domain for privacy-friendly analytics. |

## Examples

### Development

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Production

```env
NEXT_PUBLIC_SITE_URL=https://tinkuy.com
NEXT_PUBLIC_GRAPHQL_URL=https://api.tinkuy.com/graphql
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
RESEND_API_KEY=re_123456789
EMAIL_FROM=noreply@tinkuy.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Only use them for public, non-sensitive configuration.
- Supabase integration is optional. If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set, the app falls back to the GraphQL backend.
- MercadoPago and email (Resend) are optional features; comment them out if not needed.
- Analytics tools are optional; only set the one you're using.
