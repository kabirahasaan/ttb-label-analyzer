---
title: Development Setup
layout: default
parent: Quick Start
nav_order: 1
---

# Development Setup Guide

Complete setup for local development with detailed explanations.

## Prerequisites

### Verify Your System

```bash
# Check Node.js version (must be 20+)
node --version

# Check PNPM version (must be 8+)
pnpm --version

# Check Git is installed
git --version
```

If any are missing, install from [nodejs.org](https://nodejs.org), [pnpm.io](https://pnpm.io), or [git-scm.com](https://git-scm.com).

## Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/kabirahasaan/ttb-label-analyzer.git
cd ttb-label-analyzer

# Verify you're in the right place
ls -la
# Should show: apps/, libs/, docs/, package.json, README.md, etc.
```

## Step 2: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Expected output shows installing for:
# - Root workspace
# - apps/api (NestJS backend)
# - apps/web (Next.js frontend)
# - libs/* (Shared libraries)
```

### What Gets Installed?

| Package        | Purpose                     | Location     |
| -------------- | --------------------------- | ------------ |
| **NestJS**     | Backend API framework       | `apps/api`   |
| **Next.js**    | Frontend React framework    | `apps/web`   |
| **PostgreSQL** | Database (via Docker)       | Container    |
| **TypeScript** | Type safety across codebase | All packages |
| **Jest**       | Unit/integration tests      | All packages |
| **Playwright** | E2E UI tests                | `e2e/`       |

### Troubleshooting Installation

**Issue**: "Cannot find pnpm"

```bash
npm install -g pnpm@latest
```

**Issue**: "Peer dependency conflicts"

```bash
pnpm install --no-strict-peer-dependencies
```

**Issue**: "Port already in use"

```bash
# Kill process on the port
lsof -ti:3000 | xargs kill -9    # For web app
lsof -ti:3001 | xargs kill -9    # For API
lsof -ti:5432 | xargs kill -9    # For database
```

## Step 3: Start Development Environment

### Option A: Using npm Scripts (Recommended)

```bash
# Start both API and web app
pnpm dev

# This runs in watch mode:
# - API: http://localhost:3001
# - Web app: http://localhost:3000
# - API docs: http://localhost:3001/api/docs
```

### Option B: Using Docker Compose

```bash
# Start all services (API, web, database)
docker-compose up

# Services will be available at:
# - Web app: http://localhost
# - API: http://localhost:3001
# - Database: postgres://user:password@localhost:5432/ttb-db
```

### Option C: Terminal Tabs (Full Control)

Open three terminal tabs:

**Tab 1: API Server**

```bash
pnpm nx run api:serve
# Output: [NestFactory] Nest application successfully started

# Will be at http://localhost:3001
```

**Tab 2: Web App**

```bash
pnpm nx run web:serve
# Output: ▲ Next.js X.X.X

# Will be at http://localhost:3000
```

**Tab 3: Database (Optional)**

```bash
docker-compose up postgres
# Output: PostgreSQL is ready
```

## Step 4: Verify Everything Works

### Check API Health

```bash
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","version":"1.0.0","uptime":...}
```

### List Test Data

```bash
curl http://localhost:3001/applications | jq '.'

# Expected: List of pre-seeded test applications
```

### Access Web App

Open browser: http://localhost:3000

You should see the TTB Label Analyzer interface with:

- Navigation bar at top
- "Upload Label" section
- "Batch Validation" option
- "Application Form" for managing applications
- "Validation Results" to view history

### Access API Documentation

Open browser: http://localhost:3001/api/docs

Interactive Swagger UI showing all API endpoints.

## Step 5: Understand the Architecture

```
Development Environment
├── Frontend (Next.js)
│   ├── URL: http://localhost:3000
│   ├── Files: apps/web/src/
│   └── Auto-reload: Yes (watch mode)
│
├── Backend (NestJS)
│   ├── URL: http://localhost:3001
│   ├── Files: apps/api/src/
│   └── Auto-reload: Yes (watch mode)
│
└── Database (PostgreSQL)
    ├── Host: localhost:5432
    ├── Database: ttb_db
    └── User: postgres (password: postgres)
```

## Common Development Tasks

### Run Tests

```bash
# All tests
pnpm test

# Specific package
pnpm test libs/validation-engine

# Watch mode for specific file
pnpm test --watch libs/ttb-rules
```

### Run API Only (No Web)

```bash
pnpm nx run api:serve
```

### Run Web Only (No API)

```bash
# First start API separately, then:
pnpm nx run web:serve
```

### Build for Production

```bash
# Build both API and web
pnpm build

# Output in:
# - apps/api/dist/
# - apps/web/.next/
```

### View Code Coverage

```bash
pnpm test:coverage

# Open results
open coverage/index.html
```

## Environment Variables

### Default Development Values

`.env` file (auto-created):

```bash
# API
API_HOST=localhost
API_PORT=3001

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ttb_db

# CORS (allow local development)
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Customizing Variables

Create `.env.local` to override:

```bash
# Use different API port for development
API_PORT=4000

# Connect to remote database
DATABASE_URL=postgresql://user:pass@remote.host:5432/prod_db
```

## Next Steps

1. **[Quick Demo](./02-quick-demo.md)** - Run your first validation
2. **[Test Guide](../testing/index.md)** - Learn how to test
3. **[Test Data](../test-data/index.md)** - Understand sample data
4. **[API Docs (Production)](https://ttb-label-analyzer-production.up.railway.app/api/docs)** - Explore endpoints

## Getting Help

| Issue                      | Solution                            |
| -------------------------- | ----------------------------------- |
| Port already in use        | `lsof -ti:PORT \| xargs kill -9`    |
| Dependencies won't install | `pnpm store prune && pnpm install`  |
| API won't start            | Check `DATABASE_URL` in `.env`      |
| Web app shows 404          | Make sure API is running on `:3001` |
| Tests failing              | Delete `node_modules` and reinstall |

## IDE Setup (VSCode)

### Recommended Extensions

- TypeScript Vue Plugin
- ESLint
- Prettier
- REST Client (for API testing)
- PostgreSQL

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

**Next**: [Run Your First Validation →](./02-quick-demo.md)
