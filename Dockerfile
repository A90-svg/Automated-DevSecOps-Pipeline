# ============================================
# FINSECURE APP - DOCKERFILE
# ============================================
# Multi-stage build for Node.js ES Modules
# ============================================

# Stage 1: Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (note: u can add this if u only want to install production rather than the whole departments: RUN npm ci --only=production)
RUN npm ci --only=production

# Stage 2: Production
FROM node:22-alpine AS production

LABEL maintainer="finsecureapp@gmail.com"
LABEL version="1.0"
LABEL description="FinSecure Application (demo fintech app used as a testbed for the automated devsecops pipeline)"

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy package files
COPY package*.json ./

# Copy application files
COPY server.js ./
COPY public/ ./public/

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]