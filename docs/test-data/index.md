---
title: Test Data Management
layout: default
nav_order: 4
has_children: true
---

# Test Data Management Guide

Understand, locate, generate, and use test data for development and validation testing.

## Overview

The application comes with comprehensive test data for development and testing:

| Type | Count | Auto-Seeded | Location |
|------|-------|------------|----------|
| **Test Applications** | 9 | ✅ Yes | API startup |
| **Label Images** | 12 | ✅ Yes | `public/test-images/` |
| **Batch CSV Examples** | 5 | ✅ Yes | `docs/test-data/` |
| **Test Scenarios** | 20+ | ✅ Yes | Database |

## Quick Start

### Access Test Data (Development)

```bash
# List all test applications
curl http://localhost:3001/applications | jq '.'

# Get specific application by COLA
curl http://localhost:3001/applications/cola/COLA-2024-001 | jq '.'

# View test image
open apps/web/public/test-images/beer-label-1.jpg
```

### Access Test Data (Production)

```bash
# Same API endpoints, different domain
curl https://ttb-label-analyzer-production.up.railway.app/applications | jq '.'
```

## Test Applications

### Pre-Seeded Applications

9 test applications automatically loaded on API startup:

| Brand Name | COLA | ABV | Net Contents | Status |
|-----------|------|-----|--------------|--------|
| **Coca-Cola** | COLA-2024-001 | 5.2% | 12 oz | Valid |
| **Bud Light** | COLA-2024-002 | 4.2% | 12 oz | Valid |
| **Samuel Adams** | COLA-2024-003 | 5.1% | 12 oz | Valid |
| **Heineken** | COLA-2024-004 | 5.0% | 12 oz | Valid |
| **Guinness** | COLA-2024-005 | 4.2% | 14.9 oz | Valid |
| **Stella Artois** | COLA-2024-006 | 5.0% | 11.2 oz | Valid |
| **Corona** | COLA-2024-007 | 4.6% | 12 oz | Valid |
| **Modelo** | COLA-2024-008 | 4.7% | 12 oz | Valid |
| **Test Brand** | (No COLA) | 5.5% | 12 oz | Valid |

### View Application Details

**Via API:**
```bash
curl http://localhost:3001/applications/cola/COLA-2024-001 | jq '.'

# Response:
{
  "id": "app-coca-cola",
  "brandName": "Coca-Cola",
  "alcoholByVolume": 5.2,
  "netContents": "12 oz",
  "producerName": "The Coca-Cola Company",
  "colaNumber": "COLA-2024-001",
  "createdAt": "2026-03-07T12:00:00Z"
}
```

**Via Web UI:**
1. Go to "Application Form"
2. Applications automatically load in dropdown
3. Click to select and view details

### Create New Test Application

**Via Web UI:**
1. Go to "Application Form"
2. Fill in fields:
   - Brand Name
   - ABV (0-100)
   - Net Contents (e.g., "12 oz")
   - Producer Name
   - Approval Date (optional)
3. Click "Save Application"

**Via API:**
```bash
curl -X POST http://localhost:3001/applications \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "My Test Brand",
    "alcoholByVolume": 5.5,
    "netContents": "12 oz",
    "producerName": "My Brewery",
    "approvalDate": "2024-03-08"
  }'
```

**Via CSV Batch Upload:**
1. Go to "Batch Validation"
2. Prepare CSV:
```csv
brandName,alcoholByVolume,netContents,producerName,approvalDate
"New Brand 1",6.2,"16 oz","Brewery A","2024-01-01"
"New Brand 2",5.0,"12 oz","Brewery B","2024-01-02"
```
3. Upload CSV
4. Applications are created from batch

## Label Test Images

### Finding Test Images

**In Code:**
```
apps/web/public/test-images/
├── beer-label-1.jpg
├── beer-label-2.jpg
├── wine-label-1.jpg
├── ...
└── edge-case-blur.jpg
```

**12 sample images included:**
- 4 beer labels (clear, valid)
- 2 wine labels (clear, valid)
- 2 spirit labels (clear, valid)
- 2 edge cases (blurry, rotated)
- 2 problematic (missing info, foreign language)

### Use Test Images (Development)

```bash
# Open image to preview
open apps/web/public/test-images/beer-label-1.jpg

# Use in web app:
# Go to "Upload Label" → Select beer-label-1.jpg
```

### Use Test Images (Production)

Test images not deployed to production (file size).

**Instead:**
1. Download from local repo
2. Use any real label image
3. Or use test images from `docs/test-images/`

### Image Requirements

For upload to work:
- **Format**: JPG, PNG, or WebP
- **Size**: < 10 MB
- **Dimensions**: 300x400 minimum
- **Quality**: Readable text preferred

### Generate More Test Images

```bash
# 1. Collect real label images
# 2. Resize to standard size
convert input.jpg -resize 800x600 test-label.jpg

# 3. Place in docs/test-images/
mv test-label.jpg docs/test-images/

# 4. Document the image
echo "Clear beer label, valid government warning" > docs/test-images/beer-label-new.txt
```

## Batch Upload CSV Format

### CSV Structure

```csv
brandName,alcoholByVolume,netContents,producerName,approvalDate,colaNumber
"Test Brand 1",5.5,"12 oz","Brewery A","2024-01-01","COLA-2024-001"
"Test Brand 2",6.2,"16 oz","Brewery B","2024-01-02",
"Test Brand 3",4.8,"12 oz","Brewery C",,
```

### Column Details

| Column | Type | Required | Example |
|--------|------|----------|---------|
| **brandName** | String | ✅ Yes | "Coca-Cola" |
| **alcoholByVolume** | Number | ✅ Yes | 5.2 |
| **netContents** | String | ✅ Yes | "12 oz" |
| **producerName** | String | ✅ Yes | "Coca-Cola Company" |
| **approvalDate** | Date | ❌ No | "2024-01-01" |
| **colaNumber** | String | ❌ No | "COLA-2024-001" |

### Example CSV Files

**Simple (3 columns):**
```csv
brandName,alcoholByVolume,netContents
"Brand A",5.5,"12 oz"
"Brand B",6.0,"16 oz"
```

**Complete (6 columns):**
```csv
brandName,alcoholByVolume,netContents,producerName,approvalDate,colaNumber
"Coca-Cola",5.2,"12 oz","Coca-Cola Co.","2023-01-01","COLA-2024-001"
"Bud Light",4.2,"12 oz","Anheuser-Busch","2023-06-15","COLA-2024-002"
```

**Large Batch (100 rows):**
- See `docs/test-data/bulk-sample.csv`
- Use for load testing
- Tests API performance with >1000 applications

### Upload via Web UI

1. Go to "Batch Validation"
2. Click "Download Sample CSV" to get template
3. Fill in your data
4. Drag and drop or select file
5. System processes all rows
6. Download results when complete

### Upload via API

```bash
# Prepare CSV file
cat > batch.csv << 'EOF'
brandName,alcoholByVolume,netContents,producerName
"Brand A",5.5,"12 oz","Brewery A"
"Brand B",6.0,"16 oz","Brewery B"
EOF

# Upload
curl -X POST http://localhost:3001/applications/batch \
  -H "Content-Type: application/json" \
  -d @batch.csv
```

## Validation Test Scenarios

### Scenario 1: Perfect Match (Should Pass ✅)

Create application:
- Brand Name: "Test Exact"
- ABV: 5.5%
- Net Contents: "12 oz"
- Producer: "Test Brewery"

Expected Result:
- ✅ **Valid** - 95%+ confidence
- All rules pass
- Perfect match

### Scenario 2: Minor Discrepancy (Should Warn ⚠️)

Create application:
- Brand Name: "Test Close"
- ABV: 5.5%
- Net Contents: "12 oz"

Upload label showing:
- ABV: 5.6% (0.1% off)
- Producer: "Test Brewerys" (typo)

Expected Result:
- ⚠️ **Warning** - 85% confidence
- Minor discrepancies flagged
- Recommend review

### Scenario 3: Major Issue (Should Fail ❌)

Create application:
- Brand Name: "Test Mismatch"
- ABV: 5.5%

Upload label showing:
- Brand Name: "Different Brand"
- ABV: 8.0% (2.5% off)
- Missing producer info

Expected Result:
- ❌ **Error** - <70% confidence
- Critical issues listed
- Requires fixes

### Scenario 4: Missing Application (Should Warn)

Upload label with no matching application in database

Expected Result:
- ⚠️ **Warning**
- Data extracted correctly
- No COLA cross-check possible

### Scenario 5: Edge Cases

Test with:
- Very small ABV (0.5%)
- Maximum ABV (100%)
- Unusual net contents ("500ml", "1L")
- Special characters in brand name

## Data Persistence

### Development (Reset on Restart)

By default, uses in-memory database:
- ✅ Fast
- ✅ Easy to reset
- ❌ Data lost on restart

To persist across restarts:
```bash
# Use PostgreSQL in Docker
docker-compose up postgres

# Set DATABASE_URL to connect
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ttb_db
pnpm dev
```

### Production (Persistent)

Uses Railway PostgreSQL:
- ✅ Data persists
- ✅ Backups automatic
- ✅ Secure

Data automatically backed up by Railway daily.

## Resetting Test Data

### Clear All Applications

**Via API (if endpoint exists):**
```bash
# Reset database (development only)
curl -X POST http://localhost:3001/admin/reset
```

**Via Database:**
```bash
# Connect to database
psql postgresql://postgres:postgres@localhost:5432/ttb_db

# Truncate tables
TRUNCATE applications, labels, validations CASCADE;
```

### Restart with Fresh Data

```bash
# Kill API
Ctrl+C

# API auto-reseeds on startup
pnpm nx run api:serve

# All 9 test applications reloaded
```

## Next Steps

- [**Application Data Management**](../application-data/index.md) - Manage applications
- [**Label Images Guide**](../label-images/index.md) - Work with label images
- [**Testing Guide**](../testing/index.md) - Run tests with data

---

**Back**: [Documentation →](../index.md)
