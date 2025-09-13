# Use the official Bun Debian image
FROM oven/bun:1-debian AS base

# Install system dependencies and Node.js
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tzdata \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy workspace configuration
COPY package.json ./
COPY apps/midori/package.json ./apps/midori/
COPY apps/momoi/package.json ./apps/momoi/
COPY packages/auth/package.json ./packages/auth/
COPY packages/database/package.json ./packages/database/
COPY packages/utils/package.json ./packages/utils/

# Copy source code for workspace dependencies (only what's needed for dependency resolution)
COPY apps/momoi/ ./apps/momoi/
COPY packages/ ./packages/

# Install dependencies with optimizations (include devDependencies for build)
RUN bun install

# Generate Prisma client for Linux Alpine
RUN cd packages/database && bunx prisma generate

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies and workspace packages from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/momoi ./apps/momoi

# Copy workspace configuration
COPY package.json tsconfig.json ./

# Copy midori app source
COPY apps/midori/ ./apps/midori/

# Build the application with optimizations using Node.js
RUN cd apps/midori && \
    NEXT_TELEMETRY_DISABLED=1 OTEL_SDK_DISABLED=true npx next build

# Production image
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV OTEL_SDK_DISABLED=true
ENV TMPDIR=/tmp
ENV HOME=/app
ENV BUN_INSTALL_CACHE_DIR=/app/.bun
ENV BUN_CACHE_DIR=/app/.cache
ENV XDG_CACHE_HOME=/app/.cache
ENV XDG_DATA_HOME=/app/.local

# Create non-root user
RUN addgroup --system --gid 1001 bunuser && \
    adduser --system --uid 1001 --home /app --shell /bin/bash bunuser

# Copy the built application
COPY --from=builder /app/apps/midori/public ./public

# Set up directories with proper permissions
RUN mkdir -p .next && \
    mkdir -p public && \
    mkdir -p packages && \
    mkdir -p /tmp && \
    mkdir -p /app/.bun && \
    mkdir -p /app/.cache && \
    mkdir -p /app/.local && \
    chown -R bunuser:bunuser .next && \
    chown -R bunuser:bunuser public && \
    chown -R bunuser:bunuser packages && \
    chown -R bunuser:bunuser /tmp && \
    chown -R bunuser:bunuser /app/.bun && \
    chown -R bunuser:bunuser /app/.cache && \
    chown -R bunuser:bunuser /app/.local

# Copy the built application
COPY --from=builder --chown=bunuser:bunuser /app/apps/midori/.next ./.next
COPY --from=builder --chown=bunuser:bunuser /app/apps/midori/public ./public
COPY --from=builder --chown=bunuser:bunuser /app/apps/midori/package.json ./package.json

# Copy Next.js dependencies
COPY --from=builder --chown=bunuser:bunuser /app/node_modules ./node_modules

# Copy only necessary workspace packages for runtime
COPY --from=builder --chown=bunuser:bunuser /app/packages ./packages

# Ensure all files are owned by bunuser before switching
RUN chown -R bunuser:bunuser /app

# Temporarily run as root to debug permission issues
# TODO: Switch back to non-root user once permissions are fixed
# USER bunuser

# Expose port
EXPOSE 3000

# Set runtime environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Start the application
CMD ["npx", "next", "start"]
