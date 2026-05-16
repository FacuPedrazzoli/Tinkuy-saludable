# ===========================================
# Dockerfile - Frontend (Next.js Production)
# ===========================================
# Multi-stage build for minimal image size
# Optimized for Dokploy deployment

# ─── Stage 1: Dependencies ───
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only for package management
COPY package.json package-lock.json* ./
RUN npm ci --only=production --ignore-scripts

# ─── Stage 2: Builder ───
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client (if needed)
RUN npx prisma generate --no-engine

# Build Next.js application
RUN npm run build

# ─── Stage 3: Runner (Minimal Image) ───
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

# Copy Prisma schema for migrations if needed
COPY --from=builder /app/prisma ./prisma

# Use non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start standalone server
CMD ["node", "server.js"]
