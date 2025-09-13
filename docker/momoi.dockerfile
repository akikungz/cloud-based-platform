# Use the official Bun image
FROM oven/bun:1-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata

# Copy package files
COPY apps/momoi/package.json apps/momoi/bunfig.toml ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY apps/momoi/ .

# Copy the root package.json and tsconfig files for monorepo setup
COPY package.json tsconfig.json ./
COPY apps/momoi/tsconfig.json ./apps/momoi/

# Create a non-root user
RUN addgroup --system --gid 1001 bunuser
RUN adduser --system --uid 1001 bunuser

# Change ownership of the app directory
RUN chown -R bunuser:bunuser /app

# Switch to non-root user
USER bunuser

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD bun --version || exit 1

# Start the application
CMD ["bun", "run", "index.ts"]
