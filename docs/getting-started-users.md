---
title: Getting Started for Users
layout: default
nav_order: 2
---

# Getting Started for Users

A complete guide for developers, QA engineers, and operations teams to get the TTB Label Analyzer running.

> **Note**: For context on design decisions, UX choices, and system assumptions, see [Design Decisions & Assumptions](./design-decisions.html).

## Choose Your Path

### 👨‍💻 I'm a Developer - I Want to Customize & Extend

**Time: 15 minutes**

1. [Development Setup](./quick-start/01-dev-setup.html) - Install everything locally
2. [Quick Demo](./quick-start/02-quick-demo.html) - Run your first validation
3. [Development Testing](./testing/01-testing-dev.html) - Write and run tests
4. [Test Data Guide](./test-data/) - Understand sample data

Then you can:

- Modify the code
- Run tests in watch mode
- Deploy your changes

### 🧪 I'm a QA Engineer - I Want to Test

**Time: 10 minutes**

1. [Quick Demo](./quick-start/02-quick-demo.html) - Try the app yourself
2. [Production Testing](./testing/02-testing-prod.html) - Test live deployment
3. [Test Coverage](./testing/03-test-coverage.html) - Review complete dev vs prod test evidence
4. [Label Images Guide](./label-images/) - Work with images

Then you can:

- Create test scenarios
- Upload label images
- Validate results
- Document issues

### 🚀 I'm in Operations - I Want to Deploy

**Time: 20 minutes**

1. [Production Deployment](./quick-start/03-production.html) - Deploy to Vercel + Railway
2. [Production Testing](./testing/02-testing-prod.html) - Verify deployment
3. [Test Data Guide](./test-data/) - Load test data
4. [Application Data Management](./application-data/) - Manage applications

Then you can:

- Monitor deployments
- Manage data
- Scale infrastructure
- Handle incidents

## 5-Minute Quick Start

```bash
# Clone the project
git clone https://github.com/kabirahasaan/ttb-label-analyzer.git
cd ttb-label-analyzer

# Install dependencies
pnpm install

# Start development
pnpm dev

# Open browser
open http://localhost:3000
```

✅ Done! API running at `http://localhost:3001`

[See Full Setup Guide →](./quick-start/01-dev-setup.html)

## First 15 Minutes - Validate Your First Label

Following the Quick Start above, now:

1. **Go to "Upload Label"** at http://localhost:3000/upload-label
2. **Create a test application:**
   - Brand Name: `Test Beer`
   - ABV: `5.5`
   - Net Contents: `12 oz`
   - Producer: `Test Brewery`
   - Click "Save"

3. **Upload a test image:**
   - Right-click `apps/web/public/test-images/beer-label-1.jpg`
   - Download or just use directly
   - Drag into upload area

4. **Watch validation happen:**
   - Progress bar shows OCR extraction
   - Rules validation running
   - Results appear

5. **See result:**
   - ✅ Valid, ⚠️ Warning, or ❌ Error
   - Rules that passed/failed
   - Extracted data from image

[Full Demo Guide →](./quick-start/02-quick-demo.html)

## What Each Guide Covers

| Guide                                              | For        | Time      | What You'll Learn               |
| -------------------------------------------------- | ---------- | --------- | ------------------------------- |
| **[Quick Start](./quick-start/)**          | Everyone   | 5 min     | Get running in minutes          |
| **[Dev Setup](./quick-start/01-dev-setup.html)**     | Developers | 10 min    | Full local environment          |
| **[Quick Demo](./quick-start/02-quick-demo.html)**   | Everyone   | 15 min    | Run first validation            |
| **[Deployment](./quick-start/03-production.html)**   | DevOps     | 20 min    | Deploy to production            |
| **[Dev Testing](./testing/01-testing-dev.html)**     | Developers | Varies    | Write tests locally             |
| **[Prod Testing](./testing/02-testing-prod.html)**   | QA/DevOps  | 30 min    | Test live deployment            |
| **[Test Coverage](./testing/03-test-coverage.html)** | QA         | 20-30 min | Dev vs prod validation evidence |
| **[Test Data](./test-data/)**              | Everyone   | Reference | Sample data details             |
| **[App Data](./application-data/)**        | QA/DevOps  | Reference | Manage applications             |
| **[Label Images](./label-images/)**        | QA/Dev     | Reference | Work with images                |

## System Requirements

Before starting, verify you have:

```bash
# Check Node.js (need 20+)
node --version   # Should be v20.x or higher

# Check PNPM (need 8+)
pnpm --version   # Should be 8.x or higher

# Check Git
git --version    # Should be 2.0 or higher

# Docker (optional, for production setup)
docker --version  # Should be 20+
```

**Not installed?** [See setup guide](./quick-start/01-dev-setup.md#prerequisites)

## Key Features You Can Try

### 1. Upload Individual Labels

- Drag-and-drop image upload
- Automatic OCR extraction
- Real-time validation
- See confidence scores
- Download results

### 2. Create Applications

- Manual entry via form
- Batch upload via CSV
- Search by COLA number
- Export data

### 3. Batch Validation

- Upload CSV with multiple applications
- Validate all at once
- Get aggregated results
- Download JSON report

### 4. View Results

- List all validations
- Click for details
- See extracted data
- Review rule checks
- Export history

### 5. API Access

- Interactive Swagger UI
- REST endpoints
- Real-time validation
- Bulk operations

## What's Automatic

You don't need to set anything up - it's pre-configured:

✅ 9 test applications pre-loaded  
✅ 12 test images included  
✅ Test CSV examples provided  
✅ Database auto-seeded  
✅ API documentation available  
✅ All tests pass

[Learn about test data →](./test-data/)

## Development vs Production

### Development (Local)

```
Frontend: http://localhost:3000
API: http://localhost:3001
Database: In-memory (resets on restart)
Setup: pnpm dev
```

✅ Fast iteration
✅ Hot reload
✅ Full debugging

[Setup guide →](./quick-start/01-dev-setup.html)

### Production (Deployed)

```
Frontend: https://ttb-label-analyzer.vercel.app
API: https://ttb-label-analyzer-production.up.railway.app
Database: PostgreSQL on Railway
Setup: Vercel + Railway
```

✅ Persistent data
✅ Auto-scaling
✅ Backups
✅ Global CDN

[Deployment guide →](./quick-start/03-production.html)

## Common Tasks

### Task: Create Test Data

→ [Application Data Management](./application-data/)

### Task: Find Test Images

→ [Label Images Guide](./label-images/)

### Task: Run Tests Locally

→ [Development Testing](./testing/01-testing-dev.html)

### Task: Test Live Deployment

→ [Production Testing](./testing/02-testing-prod.html)

### Task: Deploy to Production

→ [Production Deployment](./quick-start/03-production.html)

### Task: Understand Test Data

→ [Test Data Guide](./test-data/)

## Troubleshooting

| Problem                    | Solution                                     |
| -------------------------- | -------------------------------------------- |
| Dependencies won't install | `pnpm install --no-strict-peer-dependencies` |
| Port already in use        | `lsof -ti:3001 \| xargs kill -9`             |
| API won't start            | Check `DATABASE_URL` in `.env`               |
| Web app shows 404          | Make sure API is running on `:3001`          |
| Image won't upload         | Check file size <10MB and format is JPG/PNG  |
| Tests failing              | Delete `node_modules` and reinstall          |
| CORS error in prod         | Update `CORS_ORIGIN` in Railway              |

## Next Steps

1. **First time?** → [Quick Start](./quick-start/)
2. **Want to code?** → [Dev Setup](./quick-start/01-dev-setup.html)
3. **Want to test?** → [Testing Guide](./testing/)
4. **Want to deploy?** → [Deploy Guide](./quick-start/03-production.html)
5. **Need help?** → [Check FAQ](#faq)

## FAQ

**Q: Do I need Docker?**  
A: Optional. Without it, use `pnpm dev`. With it, use `docker-compose up`.

**Q: Can I use Node 18?**  
A: Should work but officially requires Node 20+. [Check requirements](./quick-start/01-dev-setup.md#prerequisites)

**Q: How do I reset test data?**  
A: Restart the API server. It auto-seeds on startup.

**Q: Can I use different database?**  
A: Yes. [See database config](./quick-start/01-dev-setup.md#environment-variables)

**Q: How long does validation take?**  
A: Typically 2-10 seconds depending on image quality.

**Q: Where are test images?**  
A: In `apps/web/public/test-images/` locally, or download from repo.

**Q: How do I deploy?**  
A: [See deployment guide](./quick-start/03-production.html)

**Q: Is it production ready?**  
A: Yes, deployed and running on Vercel + Railway.

## Document Quick Links

- [Quick Start](./quick-start/)
- [Development Setup](./quick-start/01-dev-setup.html)
- [Quick Demo](./quick-start/02-quick-demo.html)
- [Production Deployment](./quick-start/03-production.html)
- [Testing Guide](./testing/)
- [Development Testing](./testing/01-testing-dev.html)
- [Production Testing](./testing/02-testing-prod.html)
- [Test Data](./test-data/)
- [Application Data](./application-data/)
- [Label Images](./label-images/)

---

**Ready to start?** Pick your path above and jump in! 🚀
