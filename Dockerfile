# Production Dockerfile for Railway deployment
# Multi-stage build for optimal image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY libs/*/package.json ./libs/*/

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code and config files
COPY . .

# Build the API application
RUN npm run build

# Verify build output
RUN ls -la apps/api/dist && cat apps/api/dist/main.js | head -5

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY libs/*/package.json ./libs/*/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application from build stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/libs ./libs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "apps/api/dist/main.js"]
