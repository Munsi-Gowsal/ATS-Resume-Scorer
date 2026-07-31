# =============================================================================
# Stage 1: Dependencies
# Install all dependencies in isolation to maximize cache reuse.
# =============================================================================
FROM node:22-alpine AS deps

# Install libc6-compat for Alpine compatibility with Node.js native bindings
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifests first — only reinstalls when these change
COPY package.json package-lock.json ./

RUN npm ci --ignore-scripts


# =============================================================================
# Stage 2: Builder
# Compile the production Next.js bundle.
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Carry over installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the full source
COPY . .

# Build-time environment defaults (non-secret, public vars only)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build


# =============================================================================
# Stage 3: Runner (final, minimal image)
# Only ships the compiled output and production node_modules.
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root system user and group for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid  1001 nextjs

# Copy public assets (static files served directly)
COPY --from=builder /app/public ./public

# Copy Next.js standalone output and static chunks
# next.config.ts must set output: 'standalone'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Healthcheck: validate the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
