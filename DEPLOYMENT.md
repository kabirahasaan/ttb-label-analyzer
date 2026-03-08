# Production Deployment Guide

## Overview
- **Web (Next.js)**: Deploy to Vercel
- **API (NestJS)**: Deploy to Railway
- **Database**: Not required (in-memory storage)

---

## 1. Deploy API to Railway

### Service Configuration
1. In Railway, create a new service from your GitHub repo
2. Set the following in **Settings**:

**Environment Variables:**
```bash
NODE_ENV=production
API_PORT=$PORT
API_HOST=0.0.0.0
CORS_ORIGIN=*
LOG_LEVEL=info
LOG_FORMAT=json
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
```

**Build & Start Commands:**
- Let Railway auto-detect (it will use pnpm from package.json)
- Railway will automatically run `pnpm run build` and `pnpm run start`

**Health Check:**
- Path: `/health`

3. Deploy and note your Railway URL (e.g., `https://your-api.up.railway.app`)

---

## 2. Deploy Web to Vercel

### Project Configuration
1. In Vercel, import your GitHub repo
2. Set the following in **Settings → General**:

**Root Directory:** `apps/web`

3. Set in **Settings → Build & Development Settings**:

**Framework Preset:** Next.js

**Build Command:** `npm run build`

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
```
(Replace with your actual Railway API URL)

4. Deploy

---

## 3. Update CORS After Vercel Deployment

1. Copy your Vercel production URL (e.g., `https://your-app.vercel.app`)
2. Go back to Railway → your API service → Variables
3. Update `CORS_ORIGIN` from `*` to your Vercel URL:
   ```bash
   CORS_ORIGIN=https://your-app.vercel.app
   ```
4. Redeploy Railway service

---

## 4. Verify Deployment

### Test API Health
```bash
curl https://your-api.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-08T...",
  "version": "1.0.0",
  "uptime": 123.45,
  "database": {
    "status": "connected"
  }
}
```

### Test API Documentation
Visit: `https://your-api.up.railway.app/api/docs`

### Test Web App
1. Open your Vercel URL in browser
2. Try uploading a label or creating an application
3. Check browser DevTools → Network tab to confirm API calls work

---

## Important Notes

### In-Memory Data
- API stores all data in-memory (no database)
- Data is **reset on every redeploy or restart**
- Keep Railway to **1 instance only** to avoid split memory state

### Auto-Deploy
- Both platforms are connected to your GitHub repo
- Pushing to `main` branch triggers automatic redeployment on both

### Cost
- **Vercel Free Tier**: Sufficient for hobby projects
- **Railway Free Trial**: $5 credit for 30 days, then $5/month minimum

---

## Troubleshooting

### API Returns 502/503
- Check Railway logs for startup errors
- Verify `API_PORT=$PORT` is set (Railway assigns port dynamically)

### CORS Errors in Browser
- Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Include `https://` protocol

### Web Can't Connect to API
- Verify `NEXT_PUBLIC_API_URL` in Vercel settings
- Must be the full Railway URL with `https://`
- Rebuild Vercel (env vars require rebuild to take effect)

### Build Fails
- Check that latest code is pushed to GitHub
- Verify all dependencies are in root `package.json`
- Check platform build logs for specific errors

---

## Future Enhancements

When ready to add persistent storage:
1. Add PostgreSQL database on Railway
2. Update `DATABASE_URL` to real connection string
3. Run migrations: `npx prisma migrate deploy`
4. Remove in-memory data structures from API code
