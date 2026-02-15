# ============================================================
# Backend Dockerfile — Multi-stage build
# ============================================================
# Stage 1: Install dependencies
# Stage 2: Copy app and run
# Result: Smaller, production-ready image
# ============================================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Stage 2: Application
FROM node:20-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy dependencies from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check for ECS/Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the app
CMD ["node", "src/app.js"]
