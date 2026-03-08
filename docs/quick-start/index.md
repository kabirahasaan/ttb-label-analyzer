---
title: Quick Start
layout: default
nav_order: 1
has_children: true
---

# Quick Start Guide

Get the TTB Label Compliance Validation Platform running in minutes.

**⏱️ Time to First Run**: 5-10 minutes  
**⏱️ Time to Validate First Label**: 15 minutes

## What You'll Learn

- Install dependencies and prerequisites
- Start the application locally
- Access the web UI and API
- Load test data
- Validate your first label

## Choose Your Path

| Path | Time | For You |
|------|------|---------|
| [**Development Setup**](./01-dev-setup.md) | 10 min | Developers building features |
| [**Quick Demo**](./02-quick-demo.md) | 5 min | Quick hands-on testing |
| [**Production Deployment**](./03-production.md) | 15 min | Operations/DevOps deploying to prod |

## System Requirements

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **PNPM** | 8+ | `npm install -g pnpm` |
| **Git** | 2.0+ | [git-scm.com](https://git-scm.com) |
| **Docker** (optional) | 20+ | [docker.com](https://docker.com) |

## Running the App

### Development Mode (Local)
```bash
# Install dependencies
pnpm install

# Start both API and web app
pnpm dev

# Web app: http://localhost:3000
# API: http://localhost:3001
# API docs: http://localhost:3001/api/docs
```

### Production Mode (with Docker)
```bash
docker-compose up
# Web app: http://localhost
# API: http://localhost:3001
```

## Next Steps

1. **[Explore the Interface](./02-quick-demo.md)** - Get familiar with the UI
2. **[Understand Test Data](../test-data/index.md)** - Learn about sample data
3. **[Run Tests](../testing/index.md)** - Validate everything works
4. **[Deploy to Production](./03-production.md)** - Take it live

## Troubleshooting

**Port already in use?**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Dependency issues?**
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

**Database won't connect?**
```bash
# Restart Docker and check logs
docker-compose down
docker-compose up -d
docker-compose logs api
```

## Resources

- [Full Development Guide](01-dev-setup.md)
- [Testing Guide](../testing/index.md)
- [Test Data Guide](../test-data/index.md)
- [API Documentation](../api/index.md)
- [Deployment Guide](../deployment/index.md)
