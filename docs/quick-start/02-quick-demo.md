---
title: Quick Demo - Run Your First Validation
layout: default
parent: Quick Start
nav_order: 2
---

# Quick Demo: Run Your First Validation

Get hands-on with the platform in 15 minutes. You'll upload a label, create an application, and see validation in action.

## Prerequisites

Make sure you have [Development Setup](./01-dev-setup.html) complete:

- API running on http://localhost:3001
- Web app running on http://localhost:3000
- Test data loaded

## Demo Flow

### Step 1: Access the Web App

Open your browser: **http://localhost:3000**

You should see:

- Navigation bar with menu items
- "Upload Label" section
- "Batch Validation" option
- Footer with resources

### Step 2: Load Sample Applications

The web app automatically loads test applications from the API. You should see in the browser console or in the application form:

```
✓ Loaded 9 test applications
```

**To verify via API:**

```bash
curl http://localhost:3001/applications | jq '.[0]'

# Expected output:
{
  "id": "app-coca-cola",
  "brandName": "Coca-Cola",
  "alcoholByVolume": 5.2,
  "netContents": "12 oz",
  "producerName": "Coca-Cola Company",
  "colaNumber": "COLA-2024-001"
}
```

### Step 3: Create a New Application

Go to **Application Form** page:

1. **Fill in the form:**
   - Brand Name: `Test Beer Co`
   - COLA Number: (leave blank - optional)
   - Alcohol by Volume: `5.5`
   - Net Contents: `12 oz`
   - Producer Name: `Test Brewery`
   - Approval Date: `2024-03-08`

2. **Click "Save Application"**

3. **Verify in API:**

```bash
curl http://localhost:3001/applications | jq '.[] | select(.brandName == "Test Beer Co")'
```

### Step 4: Upload and Validate a Label

Go to **Upload Label** page:

1. **Get a test image:**
   - Option A: Use a test image from `apps/web/public/test-images/`
   - Option B: Use any beer/wine label image on your computer
   - Option C: Download from `docs/test-images/`

2. **Select application:**
   - Choose "Test Beer Co" (the one you just created)
   - Or use an existing test application like "Coca-Cola"

3. **Upload image:**
   - Click "Select Image" or drag-and-drop
   - Image is sent to API for OCR processing

4. **Validation starts automatically:**
   - Watch the progress bar:
     - 📸 **Extracting label data** via OCR
     - ✅ **Validating rules** against TTB requirements
     - 🔍 **Cross-checking** against COLA application
     - 📊 **Generating report**

5. **View results:**
   - ✅ Valid → Green checkmark, compliance details
   - ⚠️ Warning → Yellow icon, issues to address
   - ❌ Error → Red icon, critical compliance failures

### Step 5: View Validation Results

Go to **Validation Results** page:

You should see:

- List of all validations
- Status badge (Valid/Warning/Error)
- Timestamp
- Confidence score
- Click to view detailed report

### Step 6: Batch Validation

Go to **Batch Validation** page:

1. **Create test CSV:**

```csv
brandName,alcoholByVolume,netContents,producerName
"Beer Brand A",5.0,"12 oz","Brewery A"
"Beer Brand B",6.2,"16 oz","Brewery B"
"Wine Brand C",12.5,"750 ml","Winery C"
```

2. **Upload CSV:**
   - Click "Select File" or drag-and-drop
   - System processes all rows

3. **Monitor progress:**
   - See rows being validated
   - Track successes vs failures

4. **Download results:**
   - After batch completes, download JSON report
   - Contains all validation results for each row

## API Testing (Without Web UI)

### Using cURL

**1. Create an application:**

```bash
curl -X POST http://localhost:3001/applications \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "My Brand",
    "alcoholByVolume": 5.5,
    "netContents": "12 oz",
    "producerName": "My Brewery"
  }'
```

**2. Upload a label image:**

```bash
# First, create label record
curl -X POST http://localhost:3001/labels \
  -H "Content-Type: application/json" \
  -d '{"filename": "my-label.jpg"}'

# Then upload the image file
curl -X POST http://localhost:3001/labels/{labelId}/upload \
  -F "file=@path/to/your/image.jpg"
```

**3. Run validation:**

```bash
curl -X POST http://localhost:3001/validate/label \
  -H "Content-Type: application/json" \
  -d '{
    "labelId": "label-123",
    "applicationId": "app-coca-cola"
  }'
```

**4. Get validation results:**

```bash
curl http://localhost:3001/validate/results | jq '.'
```

### Using Swagger UI

Access interactive API docs: **http://localhost:3001/api/docs**

- Explore all endpoints
- Try requests directly
- See response schemas
- Test with real data

## Understanding Validation Results

### Result Structure

```json
{
  "id": "validation-123",
  "status": "valid",
  "confidence": 94.5,
  "applicationId": "app-coca-cola",
  "labelId": "label-456",
  "ruleChecks": [
    {
      "rule": "Government Warning Present",
      "status": "passed",
      "details": "Government warning text found on label"
    },
    {
      "rule": "ABV Match",
      "status": "passed",
      "details": "Label ABV (5.5%) matches application (5.5%)"
    }
  ],
  "extractedData": {
    "brandName": "Coca-Cola",
    "alcoholByVolume": 5.5,
    "netContents": "12 oz",
    "producerName": "Coca-Cola Company"
  },
  "validatedAt": "2026-03-08T16:30:00Z"
}
```

### Status Meanings

| Status      | Meaning                  | Action                   |
| ----------- | ------------------------ | ------------------------ |
| **valid**   | ✅ Passes all TTB rules  | Ready to ship            |
| **warning** | ⚠️ Minor issues detected | Review and decide        |
| **error**   | ❌ Critical violations   | Must fix before shipping |

## Common Demo Issues

### "Cannot reach API"

**Check API is running:**

```bash
curl http://localhost:3001/health
```

**If it fails:**

```bash
# Restart API
Ctrl+C in API terminal
pnpm nx run api:serve
```

### "No applications loaded"

**Verify test data:**

```bash
curl http://localhost:3001/applications
```

**If empty, reseed database:**

```bash
# Restart API (forces reseed)
Ctrl+C
pnpm nx run api:serve
```

### Image not uploading

**Check file size:**

- Max 10MB per image
- JPEG, PNG, or WebP format

**Check browser console:**

- Press F12 → Console tab
- Look for error messages

### Validation takes too long

**Check API logs:**

```bash
# Look for OCR processing messages
curl http://localhost:3001/health
```

**If stuck, restart:**

```bash
# Kill API and web app, restart
lsof -ti:3001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
pnpm dev
```

## Next Steps

1. **[Learn about Test Data](../test-data/)** - Understand the sample data
2. **[Testing Guide](../testing/)** - Write and run tests
3. **[API Docs (Production)](https://ttb-label-analyzer-production.up.railway.app/api/docs)** - Detailed endpoint documentation
4. **[Deploy to Production](./03-production.html)** - Take it live

## Tips for Best Results

### Getting Good Validation Results

1. **Use clear label images:**
   - Good lighting
   - Sharp focus
   - Straight angle
   - Complete label visible

2. **Create matching applications:**
   - Brand name must match label
   - ABV within 0.5% tolerance
   - Net contents format consistent

3. **Use test data:**
   - Pre-made test images in `public/test-images/`
   - Pre-loaded test applications
   - Known to validate correctly

### Speeding Up Development

1. **Keep terminal tabs open:**
   - One for API logs
   - One for web app logs
   - Quick restart if needed

2. **Use REST client in VSCode:**
   - Install "REST Client" extension
   - Create `test.http` file with API calls
   - Run with one click

3. **Monitor database:**
   - Use DBeaver or pgAdmin to view data
   - Verify data persists across restarts

---

**Back to**: [Quick Start →](./)  
**Next**: [Production Deployment →](./03-production.html)
