---
title: Production Testing
layout: default
parent: Testing Guide
nav_order: 2
---

# Production Testing Guide

Test the application after deployment to Vercel/Railway production environment.

## Prerequisites

- Application deployed to production (see [Deployment Guide](../quick-start/03-production.html))
- Production URLs:
  - **Web**: `https://ttb-label-analyzer.vercel.app` (your Vercel URL)
  - **API**: `https://ttb-label-analyzer-production.up.railway.app` (your Railway URL)

## Quick Production Test

### Test 1: API Health (30 seconds)

**Via Terminal:**

```bash
# Test API is accessible
curl https://ttb-label-analyzer-production.up.railway.app/health

# Expected response:
# {"status":"ok","version":"1.0.0","uptime":...,"database":{"status":"connected"}}
```

**Via Browser:**

1. Open DevTools (F12)
2. Go to Console tab
3. Paste:

```javascript
fetch('https://ttb-label-analyzer-production.up.railway.app/health')
  .then((r) => r.json())
  .then((d) => console.log('✅ API is healthy:', d));
```

### Test 2: Web App Load (1 minute)

1. Open your web app: `https://ttb-label-analyzer.vercel.app`
2. Check page loads (no 404s, no console errors)
3. Verify layout displays correctly
4. Check footer links work

**Open Browser Console (F12):**

- Should see **no red errors** only info/warn messages
- Should see `Loaded X applications` message

### Test 3: API Connectivity (2 minutes)

1. Go to **"Upload Label"** page
2. Check section that says **"Loading applications..."**
3. Should see list of applications populate (not error message)

**If you see error:**

- Check Network tab (F12)
- Look for failed requests to API
- Verify API URL matches your Railway domain

## Full Production Test Checklist

### Critical Path Tests

#### ✓ Test: Upload and Validate

1. **Go to**: Upload Label page
2. **Click**: "Select Image"
3. **Choose**: Any JPG/PNG image (or use test image)
4. **Select**: Existing application from dropdown
5. **Watch**: Progress bar (OCR → Rules → Results)
6. **Verify**: See result (Valid/Warning/Error)

**Expected**: Takes 2-10 seconds, shows result with confidence score

#### ✓ Test: Create Application

1. **Go to**: Application Form
2. **Fill**:
   - Brand Name: "Test Brand ABC"
   - ABV: 5.5
   - Net Contents: "12 oz"
   - Producer: "Test Brewery"
3. **Click**: "Save Application"
4. **Verify**: Toast notification says "Application saved"
5. **Refresh**: Page shows new app in list

#### ✓ Test: Batch Validation

1. **Go to**: Batch Validation
2. **Click**: Sample CSV download (or upload your own)
3. **Upload**: CSV file with multiple rows
4. **Watch**: Progress as rows are validated
5. **Verify**: Download results button appears
6. **Download**: JSON report

#### ✓ Test: View Results

1. **Go to**: Validation Results
2. **Verify**: Previous results displayed
3. **Check**: Export buttons (JSON, CSV)
4. **Check**: Compliance badges visible
5. **Test**: Filter/search functionality

---

## Latest Production Test Results

**Last Test Run**: March 8, 2026  
**Status**: ✅ 18/19 Tests Passing (95%)

### Summary

| Category           | Total  | Passed | Failed | Status     |
| ------------------ | ------ | ------ | ------ | ---------- |
| **Frontend Pages** | 5      | 5      | 0      | ✅ PASS    |
| **API Endpoints**  | 3      | 2      | 1      | ⚠️ PARTIAL |
| **Database**       | 1      | 1      | 0      | ✅ PASS    |
| **Content/UI**     | 10     | 10     | 0      | ✅ PASS    |
| **Overall**        | **19** | **18** | **1**  | **✅ 95%** |

### Detailed Results

#### Frontend Tests ✅

1. **Homepage** - All elements loading correctly
   - ✅ Title and tagline displayed
   - ✅ CTA buttons functional
   - ✅ 4 feature cards visible
   - ✅ Navigation working

2. **Upload Label Page** - Workflow functional
   - ✅ Step-by-step process clear
   - ✅ Application dropdown populated
   - ✅ File upload area working

3. **Batch Validation Page** - All features working
   - ✅ File upload area functional
   - ✅ All 9 applications listed
   - ✅ Batch workflow enabled

4. **Application Form** - Data entry working
   - ✅ Manual entry form functional
   - ✅ Batch upload tab present
   - ✅ 9 applications displayed

5. **Validation Results** - Results display working
   - ✅ Results table populated
   - ✅ Export buttons functional
   - ✅ Compliance badges visible

#### API Tests

1. **Health Endpoint** ✅

   ```json
   {
     "status": "ok",
     "database": { "status": "connected" },
     "uptime": 1787.2
   }
   ```

2. **Applications Endpoint** ✅
   - Returns all 9 pre-seeded applications
   - Complete data structure
   - Proper formatting

3. **API Documentation** ❌
   - Swagger UI endpoint (502 error)
   - Non-critical - core API functional

#### Database Test ✅

- ✅ PostgreSQL connected
- ✅ Data persistence working
- ✅ All 9 applications seeded
- ✅ Queries executing successfully

#### Integration Test ✅

- ✅ Frontend ↔ Backend communication
- ✅ CORS properly configured
- ✅ Environment variables set
- ✅ Data displayed on all pages

### Production URLs Tested

- **Frontend**: https://ttb-label-analyzer.vercel.app
- **API**: https://ttb-label-analyzer-production.up.railway.app
- **Health**: https://ttb-label-analyzer-production.up.railway.app/health
- **Applications**: https://ttb-label-analyzer-production.up.railway.app/applications

### Known Issues

**Issue**: Swagger documentation endpoint returns 502  
**Severity**: Low  
**Impact**: Documentation not accessible via `/api/docs`  
**Workaround**: API endpoints functional, docs in code

---

## Performance Metrics

| Metric                    | Value   | Status       |
| ------------------------- | ------- | ------------ |
| Homepage Load             | < 2s    | ✅ Good      |
| API Health Response       | < 500ms | ✅ Excellent |
| API Applications Response | < 1s    | ✅ Good      |
| Database Connection       | Stable  | ✅ Healthy   |

---

## Full Coverage Report

For comprehensive test coverage analysis including development vs production comparison, see:

[**Test Coverage Report →**](./03-test-coverage.html)

---

1. **Go to**: Validation Results
2. **Verify**: See list of recent validations
3. **Click**: One result to view details
4. **Verify**: See extracted label data and validation rules

#### ✓ Test: Navigation

1. **Test footer links:**
   - "Documentation" → goes to /docs
   - "API Reference" → goes to backend /api/docs
   - "Privacy" → goes to /privacy
   - "Terms" → goes to /terms
   - "Accessibility" → goes to /accessibility

2. **Test navigation menu:**
   - Can navigate to all main pages
   - URLs are correct
   - No 404 errors

### Performance Tests

#### Load Time (<3 seconds)

```bash
# Measure using curl
time curl -s https://ttb-label-analyzer.vercel.app > /dev/null

# Using browser DevTools:
# F12 → Network tab → Reload
# Check "Finish" time in bottom bar
# Should be <3 seconds
```

#### API Response Time (<500ms)

```bash
# Test GET applications
time curl https://ttb-label-analyzer-production.up.railway.app/applications > /dev/null

# Test validation endpoint
time curl -X POST https://ttb-label-analyzer-production.up.railway.app/validate/label \
  -H "Content-Type: application/json" \
  -d '{"labelId":"test","applicationId":"test"}'
```

#### Network Requests

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Reload page**
4. **Review requests:**
   - Count: Should be 10-20 total
   - Size: Page + assets < 500KB
   - Cached: Some should be from cache

### Security Tests

#### ✓ HTTPS Only

```bash
# Should redirect HTTP to HTTPS
curl -I http://ttb-label-analyzer.vercel.app
# Expected: 301/302 redirect to https://
```

#### ✓ CORS Properly Configured

```javascript
// In browser console, from different origin:
fetch('https://ttb-label-analyzer-production.up.railway.app/applications')
  .then((r) => r.json())
  .then((d) => console.log('CORS works:', d))
  .catch((e) => console.error('CORS blocked:', e));
```

#### ✓ No Sensitive Data Exposed

1. **Check Network tab** (F12)
2. **Look at API responses** - verify no:
   - Database passwords
   - API keys
   - User credentials
   - Internal paths

#### ✓ Environment Variables Hidden

```javascript
// In browser console:
console.log(process.env);
// Should NOT show API_PORT, DATABASE_URL, etc.
// Only NEXT_PUBLIC_* variables should be visible
```

### Data Persistence Tests

#### ✓ Data Survives Refresh

1. **Create application**: "Test App 12345"
2. **Refresh page** (Cmd+R)
3. **Verify**: App still appears in list

#### ✓ Validation History Persists

1. **Validate a label**
2. **Go to Results page**
3. **Refresh page**
4. **Verify**: Result still appears

#### ✓ Batch Results Downloadable

1. **Do batch validation**
2. **Download results** as JSON
3. **Verify file**:
   - Opens without error
   - Contains all rows
   - Timestamps are valid

## Test Data in Production

### Accessing Test Applications

```bash
# List all applications via API
curl https://ttb-label-analyzer-production.up.railway.app/applications | jq '.'

# Get specific application
curl https://ttb-label-analyzer-production.up.railway.app/applications/cola/COLA-2024-001 | jq '.'
```

### Using Pre-Seeded Data

The API comes with test data pre-loaded:

- 9 test applications
- Known validation scenarios
- Use these for consistent testing

### Adding Your Own Test Data

1. **Create application via UI:**
   - Go to Application Form
   - Fill in details
   - Save

2. **Or via API:**

```bash
curl -X POST https://ttb-label-analyzer-production.up.railway.app/applications \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "My Test Brand",
    "alcoholByVolume": 5.5,
    "netContents": "12 oz",
    "producerName": "My Brewery"
  }'
```

## Monitoring Dashboards

### Vercel Analytics

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View:
   - **Analytics** tab: Page views, response times
   - **Deployments** tab: Build status, deployment history
   - **Events** tab: Errors, edge logs

### Railway Monitoring

1. Go to [railway.app](https://railway.app)
2. Select your project
3. Go to API service
4. View:
   - **Logs** tab: Real-time logs
   - **Deployments** tab: Build status
   - **Metrics** tab: CPU, Memory, Network

## Error Tracking

### View Errors in Production

**In browser console:**

```javascript
// Errors appear here when they happen
// Look for red messages

// Check network failures
fetch('https://api-endpoint').catch((e) => console.error('Failed:', e));
```

**In Vercel logs:**

1. Dashboard → Project → Deployments
2. Click latest deployment
3. View Logs section
4. Search for "Error" or specific error type

**In Railway logs:**

1. Dashboard → API service
2. Click Deployments tab
3. Select latest deployment
4. View Logs section
5. Real-time log streaming

### Common Production Errors

| Error                        | Cause                          | Fix                                   |
| ---------------------------- | ------------------------------ | ------------------------------------- |
| "Cannot reach API"           | API URL wrong or service down  | Check `NEXT_PUBLIC_API_URL` in Vercel |
| "CORS error"                 | Frontend origin not allowed    | Update `CORS_ORIGIN` in Railway       |
| "Cannot upload image"        | File too large or format wrong | Use JPG < 10MB                        |
| "Validation timeout"         | OCR taking too long            | Check API logs for bottlenecks        |
| "Database connection failed" | Connection string invalid      | Verify `DATABASE_URL` in Railway      |

## Load Testing

### Test with Multiple Concurrent Users

Using `curl` or Apache `ab`:

```bash
# Install ab (comes with Apache)
# Mac: brew install httpd

# Test with 10 concurrent users, 100 requests
ab -n 100 -c 10 https://ttb-label-analyzer.vercel.app/

# Output shows:
# Requests per second: 12.5
# Mean time per request: 80ms
# Failed requests: 0
```

### Expected Performance

| Metric          | Target   | Typical            |
| --------------- | -------- | ------------------ |
| Requests/sec    | >5       | 10-20              |
| Response time   | <500ms   | 100-300ms          |
| Failed requests | 0        | Occasional timeout |
| Throughput      | >500KB/s | 1-5MB/s            |

## Deployment Validation Checklist

Before considering deployment successful:

- ✅ API health endpoint responds
- ✅ Web app loads without 404s
- ✅ Applications list loads from API
- ✅ Can create new application
- ✅ Can upload label image
- ✅ Validation runs and shows result
- ✅ Can do batch validation
- ✅ Can view validation results
- ✅ All footer links work
- ✅ No console errors
- ✅ HTTPS enforced
- ✅ Response times <500ms
- ✅ Data persists after refresh

## Rollback Procedure

If production is broken, rollback quickly:

**In Vercel:**

```
Dashboard → Deployments → Select previous working deployment → Promote to Production
```

**In Railway:**

```
Dashboard → API → Deployments → Select previous working → Click Redeploy
```

## Documentation Validation

Test that documentation is accessible:

1. **API Docs**: `https://ttb-label-analyzer-production.up.railway.app/api/docs`
   - Should show interactive Swagger UI
   - All endpoints listed
   - Can test endpoints

2. **GitHub Pages**: Check your docs are published
   - Go to GitHub repo settings
   - Pages section should show deployed URL
   - Docs should be accessible

## Next Steps

1. **[Test Coverage](./03-test-coverage.html)** - Dev vs prod verification matrix
2. **[Design Decisions](../design-decisions.html)** - Architecture and workflow rationale
3. **[Application Data Guide](../application-data/)** - Production data management

---

**Back**: [Testing Guide →](./)
