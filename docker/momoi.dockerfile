# Use the official Bun Debian image
FROM oven/bun:1.2-debian AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for faster builds
ENV BUN_INSTALL_CACHE_DIR=/tmp/bun-cache
ENV BUN_INSTALL_CACHE_DISABLE=false

# Install dependencies stage
FROM base AS deps
WORKDIR /app

# Copy workspace configuration and package files first for better caching
COPY package.json ./
COPY apps/momoi/package.json ./apps/momoi/
COPY apps/momoi/bunfig.toml ./apps/momoi/
COPY packages/auth/package.json ./packages/auth/
COPY packages/database/package.json ./packages/database/
COPY packages/utils/package.json ./packages/utils/

# Install dependencies first (this layer will be cached if package.json files don't change)
RUN bun install --frozen-lockfile

# Copy source code for workspace dependencies
COPY packages/ ./packages/

# Generate Prisma client for Debian
RUN cd packages/database && bunx prisma generate

# Production stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 bunuser && \
    adduser --system --uid 1001 bunuser

# Copy dependencies and workspace packages from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# Copy workspace configuration
COPY package.json tsconfig.json ./
COPY apps/momoi/tsconfig.json ./apps/momoi/

# Copy momoi app source
COPY apps/momoi/ ./apps/momoi/

# Set proper ownership
RUN chown -R bunuser:bunuser /app

# Switch to non-root user
USER bunuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun --version || exit 1

# Start the application
WORKDIR /app/apps/momoi
CMD [ "bun", "run", "index.ts" ]
