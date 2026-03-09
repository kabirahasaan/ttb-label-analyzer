---
title: Getting Started (Legacy)
layout: default
permalink: /getting-started-legacy
---

# Getting Started Guide

Welcome to the TTB Label Compliance Validation Platform! This guide walks you through everything needed to get the system running, from initial setup through uploading and validating labels.

**Time to First Run**: ~5-10 minutes  
**Time to Validate First Label**: ~15 minutes

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installing Dependencies](#installing-dependencies)
3. [Running with NPM](#running-with-npm)
4. [Running with Docker](#running-with-docker)
5. [Running Tests](#running-tests)
6. [Generating Test Data](#generating-test-data)
7. [Uploading Labels](#uploading-labels)
8. [Submitting Applications](#submitting-applications)
9. [Viewing Validation Results](#viewing-validation-results)
10. [Common Issues](#common-issues)

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool        | Version | Purpose                     | Link                                |
| ----------- | ------- | --------------------------- | ----------------------------------- |
| **Node.js** | 20+     | JavaScript runtime          | [Download](https://nodejs.org/)     |
| **PNPM**    | 8+      | Package manager             | `npm install -g pnpm`               |
| **Git**     | 2.0+    | Version control             | [Download](https://git-scm.com/)    |
| **Docker**  | 20+     | (Optional) Containerization | [Download](https://www.docker.com/) |

### Verify Installations

```bash
node --version    # Should output v20.x.x or higher
pnpm --version    # Should output 8.x.x or higher
git --version     # Should output 2.x.x or higher
docker --version  # Optional: should output 20.x or higher
```

If any tool is missing or outdated, follow the links above to install/upgrade.

---

## Installing Dependencies

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/kabirahasaan/ttb-label-analyzer.git
cd ttb-label-analyzer

# Verify you're in the right directory
ls -la    # Should see: apps/, libs/, docker-compose.yml, package.json, README.md
```

### Step 2: Install All Dependencies

```bash
# Install monorepo dependencies
pnpm install

# This will:
# ✅ Install root dependencies
# ✅ Install app/api dependencies
# ✅ Install app/web dependencies
# ✅ Install all lib dependencies
# ✅ Link all packages together
```

**Troubleshooting Installation**:

If you get errors, try:

```bash
# Clear cache and reinstall
pnpm store prune
rm pnpm-lock.yaml
pnpm install
```

### Step 3: Verify Installation

```bash
# List installed packages
pnpm list --depth=0

# Should see all workspaces listed with ✓
```

### Step 4: Configure Environment

```bash
# Copy example environment file
cp .env.example .env.local

# View the file (optional - defaults are fine for development)
cat .env.local
```

**Environment Variables Explained**:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ttb_label_analyzer"
   ↳ Database connection string (using postgres service in docker-compose)

NODE_ENV="development"
   ↳ Environment mode (development, test, production)

API_PORT=3001
   ↳ Port where NestJS API runs

WEB_PORT=3000
   ↳ Port where Next.js web app runs

NEXT_PUBLIC_API_URL="http://localhost:3001"
   ↳ Frontend URL to reach backend (public = exposed to browser)

LOG_LEVEL="debug"
   ↳ Logging verbosity (debug, info, warn, error)
```

---

## Running with NPM

### Quick Start (Recommended)

Start everything with a single command:

```bash
npm run dev
```

This will:

- ✅ Start PostgreSQL database (Docker)
- ✅ Start NestJS API on `http://localhost:3001`
- ✅ Start Next.js Web UI on `http://localhost:3000`
- ✅ Watch for file changes and auto-reload

**Wait for output like this**:

```
[API] NestApplication successfully started
[WEB] ▲ Next.js ready on http://localhost:3000
[DB] postgres_1 is healthy
```

Then open in your browser:

- **Web UI**: http://localhost:3000
- **API Health**: http://localhost:3001/health
- **API Docs**: http://localhost:3001/api/docs

### Running Services Separately

If you prefer more control, run each service in a separate terminal:

**Terminal 1 - Start the API**:

```bash
pnpm --filter api dev
```

Expected output:

```
[Nest] 12345   - 03/06/2024, 10:00:00 AM     LOG [NestFactory] Nest application successfully started
[Nest] 12345   - 03/06/2024, 10:00:00 AM     LOG [App] Application listening on port 3001
```

**Terminal 2 - Start the Web App**:

```bash
pnpm --filter web dev
```

Expected output:

```
  ▲ Next.js v14.0.3
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

**Terminal 3 - Start the Database**:

```bash
docker compose up postgres
```

Expected output:

```
postgres_1  | 2024-03-06 10:00:00.000 UTC [1] LOG:  database system is ready to accept connections
```

### Building for Production

```bash
# Build all packages
npm run build

# This creates optimized builds in:
# - apps/api/dist/
# - apps/web/.next/

# Optional: Build specific package
pnpm --filter api build
pnpm --filter web build
```

---

## Running with Docker

### All-in-One Docker Stack

```bash
# Start all services
docker compose up

# Run in background
docker compose up -d

# View logs from all services
docker compose logs -f
```

**First Run Setup**:

```bash
# Initialize database (run migrations)
docker compose exec api npx prisma migrate deploy

# Seed with test data (optional)
docker compose exec api npm run db:seed
```

### Service URLs (Docker)

- **Web UI**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Database**: localhost:5432 (use psql or DBeaver to connect)

### Useful Docker Commands

```bash
# View running containers
docker compose ps

# View logs for specific service
docker compose logs -f api          # API logs only
docker compose logs -f web          # Web logs only
docker compose logs -f postgres     # Database logs only

# Stop services
docker compose down

# Stop and remove all data
docker compose down -v

# Rebuild images
docker compose build --no-cache

# Execute command in container
docker compose exec api npm run test
docker compose exec web npm run build

# Enter shell in container
docker compose exec api sh
docker compose exec postgres psql -U ttb_user -d ttb_label_analyzer
```

### Docker Development Workflow

```bash
# 1. Start stack
docker compose up -d

# 2. Watch API changes
docker compose exec api npm run dev

# 3. Watch Web changes
docker compose exec web npm run dev

# 4. Apply migrations
docker compose exec api npx prisma migrate deploy

# 5. View logs
docker compose logs -f

# 6. Stop when done
docker compose down
```

### Troubleshooting Docker

**Port Already in Use**:

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different ports in docker-compose.yml
# Change "3000:3000" to "3001:3000" for web
```

**Database Connection Failed**:

```bash
# Check if postgres is healthy
docker compose ps

# View postgres logs
docker compose logs postgres

# Reset database
docker compose down -v
docker compose up
```

---

## Running Tests

### Unit Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-run on file change)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
open coverage/index.html  # View report in browser
```

### Test Specific Packages

```bash
# Test only API
pnpm --filter api test

# Test only Web
pnpm --filter web test

# Test specific library
pnpm --filter @ttb/validation-engine test
```

### Integration Tests

```bash
# Run integration tests
npm run test -- --testPathPattern=integration

# With coverage
npm run test:coverage -- --testPathPattern=integration
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Debug mode with inspector
npm run test:e2e -- --debug

# Run specific test file
npm run test:e2e -- upload-label.spec.ts
```

### Understanding Test Output

```
PASS  apps/api/src/app/modules/label/label.service.spec.ts
  LabelService
    ✓ should create a label (45ms)
    ✓ should find label by ID (12ms)
    ✓ should throw for invalid data (8ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.345s
```

### Coverage Goals

Target: **70%+ coverage** across:

- ✓ Statements
- ✓ Branches
- ✓ Functions
- ✓ Lines

View detailed report:

```bash
npm run test:coverage
open coverage/index.html
```

---

## Generating Test Data

### Quick Data Generation

```bash
# Generate synthetic labels, applications, and test pairs
npm run generate:test-data

# Files created in test-data/ directory:
# ├── labels.json              (100 synthetic labels)
# ├── applications.json        (100 COLA applications)
# ├── matching-pairs.json      (50 matching label-app pairs)
# └── mismatched-pairs.json    (50 mismatched pairs)
```

### Using Generated Test Data

**In Unit Tests**:

```typescript
import { TestDataGenerator } from '@ttb/test-data-generator';

const label = TestDataGenerator.generateTestLabel();
const app = TestDataGenerator.generateTestApplication();
const { label, application } = TestDataGenerator.generateMatchingPair();
```

**In Database**:

```bash
# Import generated labels into database
npm run db:seed

# Or manually insert from test-data/labels.json
```

**In API Testing**:

```bash
# Get a generated label and POST it
LABEL=$(cat test-data/labels.json | jq '.[0]')
curl -X POST http://localhost:3001/labels \
  -H "Content-Type: application/json" \
  -d "$LABEL"
```

---

## Uploading Labels

### Via Web UI

**Step-by-step**:

1. **Open Web App**
   - Navigate to http://localhost:3000

2. **Click "Upload Label" Button**
   - Located in top navigation or dashboard

3. **Fill in Label Details**
   - Brand Name: `Premium Craft IPA`
   - Alcohol by Volume: `6.5` (0-100%)
   - Net Contents: `12 fl oz (355 mL)`
   - Government Warning: ✓ Required
   - Class Type: Select `beer` from dropdown
   - Producer Name: `Brewery Inc`

4. **Upload Image (Optional)**
   - Click "Choose Image"
   - Select a label image (JPEG/PNG)
   - System uses OCR to extract text

5. **Click "Upload Label"**
   - System saves label to database
   - Shows success confirmation
   - Redirects to label details page

6. **View Label Details**
   - See extracted data
   - View OCR results
   - Copy label ID for validation

### Via API (cURL)

```bash
# Create a label via REST API
curl -X POST http://localhost:3001/labels \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Premium Ale",
    "alcoholByVolume": 5.5,
    "netContents": "12 fl oz",
    "governmentWarning": "WARNING: Government warning required for alcoholic beverages",
    "classType": "beer",
    "producerName": "Brewery Inc"
  }'

# Response:
# {
#   "id": "550e8400-e29b-41d4-a716-446655440000",
#   "brandName": "Premium Ale",
#   "alcoholByVolume": 5.5,
#   ...
# }
```

**Save the ID** - you'll need it for validation:

```bash
LABEL_ID="550e8400-e29b-41d4-a716-446655440000"
```

### Batch Upload

```bash
# Navigate to /batch-validation

# Drag & drop multiple label images
# OR
# Click to select files (supports Ctrl+Click for multiple)
# OR
# Upload ZIP file containing labels

# System processes all labels in parallel
```

---

## Submitting Applications

### Via Web UI

**Step-by-step**:

1. **Open Application Form**
   - Go to http://localhost:3000/application-form

2. **Fill COLA Application Details**
   - Brand Name: `Premium Ale` (should match label)
   - Alcohol by Volume: `5.5` (should match label ±0.1%)
   - Net Contents: `12 fl oz` (should match label)
   - Producer/Importer: `Brewery Inc`
   - COLA Number: `19-00001-A` (optional, TTB reference number)
   - Approval Date: `2024-01-15` (optional)

3. **Click "Submit Application"**
   - Saves to database
   - Shows confirmation
   - Returns to form for new entry

4. **Verify in Application List**
   - View all submitted applications
   - Edit or delete as needed

### Via API (cURL)

```bash
# Create an application
curl -X POST http://localhost:3001/applications \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "Premium Ale",
    "alcoholByVolume": 5.5,
    "netContents": "12 fl oz",
    "producerName": "Brewery Inc",
    "colaNumber": "19-00001-A",
    "approvalDate": "2024-01-15T00:00:00Z"
  }'
```

### Update Application

```bash
APP_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X PUT http://localhost:3001/applications/$APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "colaNumber": "19-00001-B"  # Updated COLA number
  }'
```

### List Applications

```bash
# Get all applications
curl http://localhost:3001/applications

# Get specific application
APP_ID="550e8400-e29b-41d4-a716-446655440000"
curl http://localhost:3001/applications/$APP_ID
```

---

## Viewing Validation Results

### Via Web UI

**Step 1: Navigate to Results Page**

- Go to http://localhost:3000/validation-results

**Step 2: View Summary**

- Total Validations
- Compliant Count
- Non-Compliant Count
- Warnings Count

**Step 3: View Detailed Results**

- Click on any result to expand details
- See:
  - ✓ Pass/Fail for each TTB rule
  - ⚠️ Warnings and suggestions
  - ❌ Errors with details
  - 🔍 Recommended fixes

**Step 4: Export Results**

- Download as JSON
- Download as CSV
- Print for records

### Via API (cURL)

**Validate a Single Label**:

```bash
LABEL_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:3001/validate/label \
  -H "Content-Type: application/json" \
  -d "{\"labelId\": \"$LABEL_ID\"}"

# Response:
# {
#   "labelId": "550e8400-e29b-41d4-a716-446655440000",
#   "status": "COMPLETED",
#   "isCompliant": true,
#   "ttbValidationResult": {
#     "brandNameValid": true,
#     "abvValid": true,
#     "netContentsValid": true,
#     "warningValid": true,
#     "classTypeValid": true,
#     "producerValid": true
#   },
#   "errors": [],
#   "warnings": [],
#   "createdAt": "2024-03-06T10:00:00Z"
# }
```

**Cross-Check Label vs Application**:

```bash
LABEL_ID="550e8400-e29b-41d4-a716-446655440000"
APP_ID="660e8400-e29b-41d4-a716-446655440001"

curl -X POST http://localhost:3001/validate/cross-check \
  -H "Content-Type: application/json" \
  -d "{
    \"labelId\": \"$LABEL_ID\",
    \"applicationId\": \"$APP_ID\"
  }"

# Response:
# {
#   "match": true,
#   "matchPercentage": 97.5,
#   "discrepancies": [
#     {
#       "field": "netContents",
#       "labelValue": "12 fl oz (355 mL)",
#       "applicationValue": "12 fl oz"
#     }
#   ]
# }
```

**Batch Validation Results**:

```bash
curl -X POST http://localhost:3001/batch/validate \
  -H "Content-Type: application/json" \
  -d '{
    "labelIds": [
      "550e8400-e29b-41d4-a716-446655440000",
      "550e8400-e29b-41d4-a716-446655440001",
      "550e8400-e29b-41d4-a716-446655440002"
    ]
  }'

# Response:
# {
#   "batchId": "batch-12345",
#   "totalItems": 3,
#   "processedItems": 3,
#   "successCount": 3,
#   "failureCount": 0,
#   "duration": 1234,
#   "results": [...]
# }
```

### Understanding Validation Results

**Compliance Levels**:

- 🟢 **COMPLIANT**: All TTB rules pass, no warnings
- 🟡 **WARNING**: Passes rules but has warnings (suggest review)
- 🔴 **NON_COMPLIANT**: Fails one or more rules (cannot ship)

**Common Failures**:
| Issue | Cause | Fix |
|-------|-------|-----|
| ABV Invalid | > 100% or < 0% | Update to valid range |
| Missing Warning | No government warning | Add required warning text |
| Invalid Class Type | Unknown beer/wine/spirit type | Select from valid types |
| Producer Missing | Empty producer field | Enter producer name |
| Brand Mismatch | Label ≠ Application | Verify brand name spelling |

---

## Common Issues

### Installation Issues

**Error: `command not found: pnpm`**

```bash
npm install -g pnpm
pnpm --version
```

**Error: `ENOENT: no such file or directory`**

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Runtime Issues

**Port Already in Use**

```bash
# Port 3000 (web)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Port 3001 (api)
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Port 5432 (postgres)
lsof -i :5432 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Database Connection Failed**

```bash
# Check if database is running
docker compose ps postgres

# View postgres logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres

# Reset database
docker compose down -v
docker compose up
```

**API Not Responding**

```bash
# Check API health
curl http://localhost:3001/health

# View API logs
docker compose logs api
# OR
pnpm --filter api logs
```

### Testing Issues

**Tests Fail with Timeout**

```bash
# Increase timeout
npm run test -- --testTimeout=10000
```

**Cannot Find Module '@ttb/...'**

```bash
# Rebuild monorepo
npm run build

# Clear cache
pnpm store prune
pnpm install
```

### Docker Issues

**Docker Daemon Not Running**

```bash
# macOS
open /Applications/Docker.app

# Linux
sudo systemctl start docker

# Windows
# Open Docker Desktop application
```

**Out of Disk Space**

```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune
```

---

## Getting Help

### Documentation

- **Full Setup**: See [README.md](./README.md)
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Security**: See [SECURITY.md](./SECURITY.md)
- **Testing**: See [TESTING.md](./TESTING.md)

### API Documentation

- **Interactive Docs**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/health

### Support

- Check existing GitHub issues: `https://github.com/kabirahasaan/ttb-label-analyzer/issues`
- Create new issue with error details and steps to reproduce
- Include output from: `npm run build` and test logs

---

**Next Steps**:

1. ✅ Install dependencies >> `pnpm install`
2. ✅ Start dev server >> `npm run dev`
3. ✅ Open http://localhost:3000
4. ✅ Upload a test label
5. ✅ View validation results
6. 📖 Read [README.md](./README.md) for architecture details

## Local Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd ttb-label-analyzer
```

### 2. Install Dependencies

```bash
pnpm install
```

This installs dependencies for all packages in the monorepo.

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update values in `.env.local` if needed (defaults work for local development):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ttb_label_analyzer"
NODE_ENV="development"
API_PORT=3001
WEB_PORT=3000
NEXT_PUBLIC_API_URL="http://localhost:3001"
LOG_LEVEL="debug"
```

### 4. Start Development Servers

**Option A: All-in-one command (runs API, Web, and DB)**

```bash
npm run dev
```

This command:

- Starts the NestJS API on http://localhost:3001
- Starts the Next.js frontend on http://localhost:3000
- Starts PostgreSQL database
- Watches for file changes and auto-reloads

**Option B: Run individual services**

Terminal 1 (API):

```bash
pnpm --filter api dev
```

Terminal 2 (Web):

```bash
pnpm --filter web dev
```

Terminal 3 (Database):
Ensure PostgreSQL is running locally or via Docker:

```bash
docker compose up postgres
```

### 5. Access Applications

- **Web UI**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs (Swagger UI)

## Docker Setup (Alternative)

If you prefer containerized development:

### Start All Services

```bash
docker compose up
```

Services will be available at:

- Web: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432

### View Logs

```bash
docker compose logs -f
docker compose logs -f api      # API logs only
docker compose logs -f web      # Web logs only
```

### Stop Services

```bash
docker compose down
```

### Rebuild Images

```bash
docker compose build --no-cache
docker compose up
```

## Running Tests

### Unit Tests

```bash
npm run test                 # Run all tests
npm run test:watch         # Run in watch mode
npm run test:coverage      # Generate coverage reports
```

### By Package

```bash
pnpm --filter api test              # API tests only
pnpm --filter web test              # Web tests only
pnpm --filter @ttb/validation-engine test  # Specific library
```

## Code Quality

### Linting

```bash
npm run lint              # Check for issues
npm run lint:fix          # Fix automatically fixable issues
```

### Formatting

```bash
npm run format            # Format all code
npm run format:check      # Check formatting without changes
```

## Database Operations

### Run Migrations

```bash
npm run db:migrate
```

### Seed Database

```bash
npm run db:seed
```

### Generate Test Data

```bash
npm run generate:test-data
```

This creates test files in `test-data/` directory.

## Building for Production

### Build All Packages

```bash
npm run build
```

### Build Specific Package

```bash
pnpm --filter api build
pnpm --filter web build
```

### Production Environment Variables

Create `.env.production`:

```env
NODE_ENV="production"
DATABASE_URL="your-production-db-url"
CORS_ORIGIN="your-production-domain"
LOG_LEVEL="warn"
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Database Connection Failed

Ensure PostgreSQL is running:

```bash
# Via Docker
docker compose up postgres

# Via local installation
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL service
```

### PNPM Lock File Issues

If you have lock file conflicts:

```bash
rm pnpm-lock.yaml
pnpm install
```

### Node Modules Issues

Clear and reinstall:

```bash
rm -rf node_modules
pnpm install
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/label-validation
```

### 2. Make Changes

Start dev server with auto-reload:

```bash
npm run dev
```

### 3. Run Tests

```bash
npm run test:watch
```

### 4. Format & Lint

```bash
npm run lint:fix
npm run format
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add label validation"
```

Husky will run lint-staged automatically on commit.

### 6. Push & Create PR

```bash
git push origin feature/label-validation
```

## Project Scripts Reference

| Command                      | Description                  |
| ---------------------------- | ---------------------------- |
| `npm run dev`                | Start all dev servers        |
| `npm run build`              | Build all packages           |
| `npm run test`               | Run all tests                |
| `npm run test:watch`         | Run tests in watch mode      |
| `npm run lint`               | Check code quality           |
| `npm run lint:fix`           | Fix linting issues           |
| `npm run format`             | Format code                  |
| `npm run docker:up`          | Start Docker services        |
| `npm run docker:down`        | Stop Docker services         |
| `npm run db:migrate`         | Run database migrations      |
| `npm run db:seed`            | Seed test data               |
| `npm run generate:test-data` | Generate synthetic test data |

## Next Steps

1. **Explore the API**: Visit http://localhost:3001/api/docs
2. **Test the UI**: Navigate http://localhost:3000
3. **Read ARCHITECTURE.md**: Understand system design
4. **Read TESTING.md**: Learn testing strategy
5. **Check modules documentation**: Explore individual packages

## Getting Help

- **API Docs**: http://localhost:3001/api/docs
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Security**: See [SECURITY.md](./SECURITY.md)
- **Testing**: See [TESTING.md](./TESTING.md)
- **Code Issues**: Check GitHub issues
