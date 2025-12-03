# ============================================
# FINSECURE APP - DOCKERFILE
# ============================================
# Multi-stage build for Node.js ES Modules
# 
# Security Features:
# - Non-root user (nodejs:1001)
# - Minimal Alpine base image
# - Health check endpoint
# - Production dependencies only
# ============================================

# Stage 1: Dependencies Installation
# Use separate stage to optimize layer caching
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
# Only package files are copied, not source code
COPY package*.json ./

# Install production dependencies only
# --only=production reduces image size and attack surface
# ci ensures deterministic dependency installation
RUN npm ci --only=production

# Stage 2: Production Image
# Create minimal production image
FROM node:22-alpine AS production

# Container metadata
LABEL maintainer="finsecureapp@gmail.com"
LABEL version="1.0"
LABEL description="FinSecure Application (demo fintech app used as a testbed for the automated devsecops pipeline)"

# Install curl for health check functionality
# --no-cache avoids caching index files, reduces image size
RUN apk add --no-cache curl

# Create non-root user for security
# Prevents container from running as root
# UID/GID 1001 matches common Node.js practices
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage
# Uses cached dependencies from previous stage
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy application source code
# Only copy necessary files, exclude .git, node_modules, etc.
COPY server.js ./
COPY public/ ./public/

# Set proper ownership for non-root user
# Ensures nodejs user can read/write application files
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
# Security best practice - don't run as root
USER nodejs

# Expose application port
# Port 3000 is the default for the application
EXPOSE 3000

# Set production environment variables
# NODE_ENV=production enables production optimizations
# PORT=3000 matches the exposed port
ENV NODE_ENV=production
ENV PORT=3000

# Health check configuration
# Checks /health endpoint every 30 seconds
# Allows 5 seconds for response, 3 retries before marking unhealthy
# 10 second start period allows application to initialize
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
# Runs the Node.js server with ES modules support
CMD ["node", "server.js"]