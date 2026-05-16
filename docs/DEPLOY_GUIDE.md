# Deployment Guide - Tinkuy E-commerce

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL (Frontend)                        │
│                    https://tinkuy.com                           │
│                         Next.js 14                              │
│                                                                  │
│   Apollo Client → GraphQL → https://api.tinkuy.com/graphql      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VPS (Backend)                           │
│                      api.tinkuy.com                             │
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│   │  Express    │  │  PostgreSQL │  │    Redis    │           │
│   │  + Apollo   │  │   (15-alpine)│  │  (7-alpine) │           │
│   │   Server    │  │             │  │             │           │
│   │   :4000     │  │   :5432     │  │    :6379    │           │
│   └─────────────┘  └─────────────┘  └─────────────┘           │
│          │                                                       │
│          ▼                                                       │
│   ┌─────────────┐                                               │
│   │   Nginx     │  ← Reverse proxy + Static files                │
│   │   :80       │                                               │
│   └─────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Deployment (VPS)

### 1. Prerequisites

- VPS with Docker and Docker Compose installed
- Domain pointed to VPS IP (api.tinkuy.com)
- SSL certificate (Let's Encrypt via Certbot)

### 2. Setup Steps

```bash
# Clone the backend repository
git clone https://github.com/your-org/Back-Tinkuy-Saludable.git
cd Back-Tinkuy-Saludable

# Copy environment template
cp .env.production.example .env.production

# Edit .env.production with your actual values
nano .env.production
```

### 3. Configure Environment Variables (.env.production)

```bash
# Database
DATABASE_URL=postgresql://tinkuy_user:strong_password@postgres:5432/tinkuy?schema=public

# Redis
REDIS_URL=redis://redis:6379

# JWT Secrets (generate strong random strings!)
JWT_ADMIN_SECRET=your-32-char-minimum-admin-secret-here
JWT_CUSTOMER_SECRET=your-32-char-minimum-customer-secret-here

# MercadoPago
MP_ACCESS_TOKEN=your-mp-access-token
MP_WEBHOOK_SECRET=your-mp-webhook-secret
MP_MODE=production

# Server
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://tinkuy.com

# File Upload
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE_MB=5
```

### 4. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d

# Run database migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# Seed the database (optional - for initial data)
docker-compose -f docker-compose.production.yml exec app npm run db:seed
```

### 5. Nginx Configuration

The included `nginx.conf` provides:
- Reverse proxy to Express on port 4000
- Static file serving from /app/uploads
- Gzip compression
- Security headers
- CORS configuration for frontend

### 6. SSL Certificate

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d api.tinkuy.com
```

## Frontend Deployment (Vercel)

### 1. Prerequisites

- Vercel account connected to GitHub
- Domain pointed to Vercel (tinkuy.com)

### 2. Setup Steps

```bash
# Clone the frontend repository
git clone https://github.com/your-org/tinkuy.git
cd tinkuy

# Install dependencies
npm install
```

### 3. Configure Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SITE_URL=https://tinkuy.com
NEXT_PUBLIC_GRAPHQL_URL=https://api.tinkuy.com/graphql
```

### 4. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Database Seeding (First Time Setup)

After deploying the backend, run these commands on the VPS:

```bash
# Create initial tenant
docker-compose -f docker-compose.production.yml exec app npx tsx prisma/seed.ts
```

The seed script creates:
- A default tenant (tinkuy)
- An admin user (admin@tinkuy.com / admin123)

**IMPORTANT:** Change the admin password immediately after first login!

## Troubleshooting

### Backend Issues

```bash
# Check logs
docker-compose -f docker-compose.production.yml logs -f app

# Restart services
docker-compose -f docker-compose.production.yml restart

# Check database connection
docker-compose -f docker-compose.production.yml exec app npx prisma db pull
```

### Frontend Issues

```bash
# Check build
npm run build

# Test locally with production backend
NEXT_PUBLIC_GRAPHQL_URL=https://api.tinkuy.com/graphql npm run dev
```

### Common Problems

1. **CORS errors**: Ensure FRONTEND_URL in backend .env matches your Vercel domain
2. **GraphQL connection failed**: Check that the backend is running and port 4000 is accessible
3. **Database connection failed**: Verify DATABASE_URL is correct and PostgreSQL is healthy
4. **Redis connection failed**: Check REDIS_URL and ensure Redis container is running

## File Structure

```
Back-Tinkuy-Saludable/
├── docker-compose.production.yml  # Production deployment
├── Dockerfile                      # App container
├── nginx.conf                     # Reverse proxy config
├── .env.production.example        # Environment template
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
└── src/
    ├── index.ts                  # Express server entry
    └── modules/                  # GraphQL resolvers

tinkuy/
├── vercel.json                   # Vercel config
├── .env.example                  # Environment template
└── src/
    ├── lib/graphql/              # Apollo Client + queries
    └── app/                      # Next.js pages
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong random JWT secrets (32+ chars)
- [ ] Enable HTTPS everywhere
- [ ] Set up firewall (only ports 80, 443)
- [ ] Configure rate limiting
- [ ] Review CORS settings
- [ ] Set up monitoring (Sentry, logs)
