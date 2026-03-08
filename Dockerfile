# Production Dockerfile for Railway deployment
# Multi-stage build for optimal image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY libs/*/package.json ./libs/*/

# Install all dependencies (needed for build)
RUN pnpm install --frozen-lockfile

# Copy source code and config files
COPY . .

# Build the API application
RUN pnpm run build

# Verify build output and fail fast if no known entrypoint exists
RUN set -eux; \
        ls -la apps/api/dist; \
        if [ -f apps/api/dist/main.js ]; then \
            echo "Found flat entrypoint: apps/api/dist/main.js"; \
        elif [ -f apps/api/dist/apps/api/src/main.js ]; then \
            echo "Found nested entrypoint: apps/api/dist/apps/api/src/main.js"; \
        else \
            echo "No API entrypoint found in build output" >&2; \
            exit 1; \
        fi

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY libs/*/package.json ./libs/*/

# Install production dependencies only (skip prepare/husky scripts)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built application from build stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/libs ./libs

# Normalize compiled internal lib imports to runtime JS files.
# Nx/tsc can emit requires like libs/*/src/index.ts, but the container runs JS only.
RUN node -e "const fs=require('fs');const path=require('path');const root='apps/api/dist';let updated=0;const rx=/(require\\(['\"][^'\"]*libs\\/[^'\"]*\\/src\\/[^'\"]*)\\.ts(['\"]\\))/g;function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(e.isFile()&&p.endsWith('.js')){const src=fs.readFileSync(p,'utf8');const out=src.replace(rx,'$1.js$2');if(out!==src){fs.writeFileSync(p,out);updated++;}}}}walk(root);console.log('Rewrote .ts require paths in',updated,'files');"

# Fail fast if any problematic TypeScript require path remains in runtime JS.
RUN set -eux; \
        if grep -R -nE "require\\(['\"][^'\"]*libs/.*/src/.*\\.ts['\"]\\)" apps/api/dist; then \
            echo "Found unresolved .ts require paths in dist output" >&2; \
            exit 1; \
        else \
            echo "No unresolved .ts require paths found"; \
        fi

# Verify runtime image has a valid API entrypoint
RUN set -eux; \
        if [ -f /app/apps/api/dist/main.js ]; then \
            echo "Runtime entrypoint: /app/apps/api/dist/main.js"; \
        elif [ -f /app/apps/api/dist/apps/api/src/main.js ]; then \
            echo "Runtime entrypoint: /app/apps/api/dist/apps/api/src/main.js"; \
        else \
            echo "Runtime entrypoint missing" >&2; \
            exit 1; \
        fi

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start the application (supports both flat and nested Nest build layouts)
CMD ["sh", "-c", "if [ -f apps/api/dist/main.js ]; then exec node apps/api/dist/main.js; else exec node apps/api/dist/apps/api/src/main.js; fi"]
