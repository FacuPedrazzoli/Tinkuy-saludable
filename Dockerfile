# ===========================================
# Dockerfile - Frontend (Next.js Production)
# ===========================================
# Multi-stage build for minimal image size
# Optimized for Dokploy deployment

# ─── Stage 1: Builder ───
# Next.js needs devDependencies (TypeScript, Tailwind, PostCSS) to compile,
# so this stage installs the FULL dependency tree. The standalone output
# bundles the production runtime, so the runner needs no separate deps stage.
FROM node:20-alpine AS builder
WORKDIR /app

# Declare build-time arguments so Next.js can inline NEXT_PUBLIC_* at build time.
# These must be declared here (in the stage that runs `npm run build`) and then
# converted to ENV so the Next.js compiler picks them up during bundling.
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_TENANT_ID
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_MP_PUBLIC_KEY
ARG NEXT_PUBLIC_GA_ID
ARG NEXT_PUBLIC_FB_PIXEL_ID
ARG NEXT_PUBLIC_CLARITY_ID
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MP_PUBLIC_KEY=$NEXT_PUBLIC_MP_PUBLIC_KEY
ENV NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_FB_PIXEL_ID=$NEXT_PUBLIC_FB_PIXEL_ID
ENV NEXT_PUBLIC_CLARITY_ID=$NEXT_PUBLIC_CLARITY_ID
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

# Install the full dependency tree (devDependencies included — required to build)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
RUN npm run build

# ─── Stage 2: Runner (Minimal Image) ───
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NEXT_PUBLIC_MP_PUBLIC_KEY=${NEXT_PUBLIC_MP_PUBLIC_KEY:-}

# Create uploads directory
RUN mkdir -p /app/public/uploads

# Copy built artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Use non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start standalone server
CMD ["node", "server.js"]
