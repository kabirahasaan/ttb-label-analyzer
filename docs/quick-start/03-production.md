---
title: Production Deployment
layout: default
parent: Quick Start
nav_order: 3
---

# Production Deployment Guide

Deploy the TTB Label Analyzer to production on Vercel (frontend) and Railway (backend).

## Architecture

```
Users
  ↓
Vercel (Next.js Web App)
  ↓ HTTPS
Railway API (NestJS Backend)
  ↓
PostgreSQL Database (Railway)
```

## Prerequisites

- [Vercel Account](https://vercel.com/sign-up) (free tier works)
- [Railway Account](https://railway.app) (free tier with $5 credit)
- GitHub repository (linked to both platforms)
- GitHub authentication (for deployments)

## Part 1: Deploy API to Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up or log in
3. Click **"+ New Project"**
4. Select **"Deploy from GitHub repo"**
5. Authorize Railway to access your GitHub account
6. Select `ttb-label-analyzer` repository

### Step 2: Configure API Service

1. **In Railway dashboard**, click **"New Service"**
2. Select **"From GitHub repo"**
3. Choose your branch (typically `main`)
4. Railway auto-detects `package.json` - it will use `pnpm`

### Step 3: Set Environment Variables

In Railway dashboard, go to your service → **Variables**:

```
DATABASE_URL=postgresql://...          # Railway auto-generates
API_PORT=$PORT                          # Use Railway's dynamic port
API_HOST=0.0.0.0                        # Accept all interfaces
CORS_ORIGIN=https://you-app.vercel.app # Your Vercel frontend URL
```

### Step 4: Deploy

1. **Push to GitHub:**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

2. **Railway auto-deploys** (takes 2-3 minutes)

3. **Get your API URL:**
   - Railway dashboard → Settings → Domains
   - Copy the provided URL (e.g., `https://ttb-label-analyzer-production.up.railway.app`)

4. **Test API health:**
```bash
curl https://ttb-label-analyzer-production.up.railway.app/health
# Expected: {"status":"ok",...}
```

## Part 2: Deploy Web App to Vercel

### Step 1: Add Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in
3. Click **"Add New..."** → **"Project"**
4. Import GitHub repo: `ttb-label-analyzer`
5. Click **"Import"**

### Step 2: Configure Build

Vercel should auto-detect Next.js. Verify settings:

- **Framework**: Next.js
- **Root Directory**: (leave default)
- **Build Command**: `npm run vercel-build` (should be auto-filled)
- **Output Directory**: `apps/web/.next`

### Step 3: Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```env
NEXT_PUBLIC_API_URL=https://ttb-label-analyzer-production.up.railway.app
```

**Important**: Do NOT include `:3001` or `:PORT` - Railway handles HTTPS on port 443.

### Step 4: Deploy

1. Click **"Deploy"** button
2. Wait for build to complete (2-5 minutes)
3. Once successful, you'll get a production URL like:
   - `https://ttb-label-analyzer.vercel.app`

## Part 3: Configure CORS

### Update Railway CORS Setting

Now that you have your Vercel URL, go back to Railway:

1. API service → **Variables**
2. Update `CORS_ORIGIN`:
```
CORS_ORIGIN=https://ttb-label-analyzer.vercel.app
```

3. **Redeploy** Railway service (click Redeploy button)

## Part 4: Verify Production Deployment

### Test API Connectivity

1. Open your Vercel app: `https://your-ttb-label-analyzer.vercel.app`
2. Go to **Upload Label** page
3. You should see **"Loading applications..."** and then a list of test applications
4. Try uploading a test image

### Check Browser Console

If you see errors, open browser DevTools (F12 → Console):

```javascript
// Should see API calls to:
// https://ttb-label-analyzer-production.up.railway.app/applications
```

### Manual API Test

```bash
# Test API is accessible from your machine
curl https://ttb-label-analyzer-production.up.railway.app/applications

# Check API health
curl https://ttb-label-analyzer-production.up.railway.app/health
```

## Customizing Production

### Domain Name

Replace the default Vercel domain:

1. **In Vercel** → Project Settings → Domains
2. Add your custom domain (e.g., `ttb-validator.mycompany.com`)
3. Follow DNS configuration instructions

### Database

By default, Railway PostgreSQL is used. To use your own:

1. In Railway → API service → Variables
2. Update `DATABASE_URL` to your database URL
3. Redeploy

### Scaling

| Component | Free Tier | Paid |
|-----------|-----------|------|
| **Vercel** | 100GB bandwidth/month | Unlimited |
| **Railway** | $5 credit, includes 1 PostgreSQL | $5/month minimum + usage |

For production traffic, [upgrade Railway to Pro](https://railway.app/pricing).

## Monitoring & Logs

### View API Logs

In Railway dashboard:
1. Click API service
2. Go to **Deployments** tab
3. Click latest deployment
4. View **Logs** in real-time

**Common issues:**
- `CORS error` → Check `CORS_ORIGIN` matches your Vercel URL
- `Database connection failed` → Check `DATABASE_URL` is valid
- `Port error` → Make sure `API_PORT=$PORT` is set

### View Web App Logs

In Vercel dashboard:
1. Click your project
2. Go to **Deployments** tab
3. Click latest deployment
4. View **Logs**

**Common issues:**
- `API request failed` → Check `NEXT_PUBLIC_API_URL` is set correctly
- `Build failed` → View error in logs, usually TypeScript or dependency issue

## Updating Production

### Deploy New Changes

```bash
# Make changes locally
git add .
git commit -m "Update feature xyz"
git push origin main
```

**Both Vercel and Railway auto-deploy** from main branch.

### Rollback a Deployment

**In Vercel:**
1. Deployments tab
2. Click the previous working deployment
3. Click **"Promote to Production"**

**In Railway:**
1. Deployments tab
2. Click the previous working deployment
3. Click **"Redeploy"**

## Production Checklist

- ✅ API running on Railway
- ✅ Web app running on Vercel
- ✅ `NEXT_PUBLIC_API_URL` set in Vercel
- ✅ `CORS_ORIGIN` set in Railway
- ✅ Both services redeployed
- ✅ API returns health check
- ✅ Web app loads applications from API
- ✅ Validation works end-to-end
- ✅ All pages accessible (no 404s)
- ✅ API documentation at `/api/docs`

## Troubleshooting

### "Cannot reach API" Error

**Check 1: Is API running?**
```bash
curl https://ttb-label-analyzer-production.up.railway.app/health
```

If fails → Railway service crashed. Check Railway logs.

**Check 2: Is `NEXT_PUBLIC_API_URL` set correctly?**
```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_API_URL)
```

Should show your Railway URL without port.

**Check 3: CORS blocking?**
In browser console, look for:
```
Access to XMLHttpRequest blocked by CORS policy
```

Fix: Update `CORS_ORIGIN` in Railway to match Vercel domain exactly.

### CORS Error: "Origin not allowed"

Railway is blocking your Vercel domain.

Fix:
1. Go to Railway → API service → Variables
2. Check `CORS_ORIGIN=https://YOUR-VERCEL-URL.vercel.app`
3. Redeploy Railway service

### "Build failed" on Vercel

Check the error in Vercel Deployments logs:
1. Usually TypeScript compilation error
2. Fix locally: `npm run build:web`
3. Push and retry

### "Build failed" on Railway

Check the error in Railway Deployments logs:
1. Usually missing environment variables
2. Or database connection issues
3. Fix and redeploy

## Cost Estimate

| Service | Monthly Cost | Notes |
|---------|-------------|-------|
| **Vercel** | Free *(pay as you grow)* | 100GB bandwidth included |
| **Railway** | $5/month | + database usage (~$1-2/month) |
| **Total** | ~$6-7/month | Production-grade hosting |

## Next Steps

1. **[Monitor Performance](../deployment/monitoring.md)** - Set up alerts
2. **[Scaling Guide](../deployment/scaling.md)** - Prepare for growth
3. **[Database Backups](../deployment/backups.md)** - Automatic backups

---

**Back**: [Quick Start →](./index.md)
