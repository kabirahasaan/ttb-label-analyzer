---
title: Application Data Management
layout: default
nav_order: 5
---

# Application Data Management Guide

Create, manage, and batch upload COLA applications for validation testing.

## Overview

Applications are the "golden records" - the expected label data that actual labels are validated against.

```
Application Record
├── Brand Name (required)
├── ABV 0-100% (required)
├── Net Contents (required)
├── Producer Name (required)
├── COLA Number (optional)
└── Approval Date (optional)
           ↓
      Compared Against
           ↓
         Label
      (OCR extracted)
           ↓
        Validation Result
     (Match? Warnings? Errors?)
```

## Managing Applications via Web UI

### View All Applications

**Application Form page:**
1. Go to "Application Form" in menu
2. Applications automatically load in dropdown
3. Shows available applications to select

**Batch Validation page:**
1. Go to "Batch Validation"
2. "Existing Applications" tab
3. Shows all applications with applicability

### Create Single Application

**Step-by-step:**

1. **Go to Application Form**
2. **Fill Required Fields:**
   - **Brand Name**: Company/product name
     - Example: "Coca-Cola"
     - Max 100 characters
     - Must be unique (recommended)
   
   - **Alcohol by Volume (ABV)**: Percentage 0-100
     - Example: 5.2
     - Decimal allowed (5.2, 5.25, 5.255)
     - Required for TTB compliance
   
   - **Net Contents**: Volume/weight descriptor
     - Example: "12 oz" or "750 ml"
     - Include unit (oz, ml, fl oz, etc.)
     - Important for validation
   
   - **Producer Name**: Manufacturer or distributor
     - Example: "The Coca-Cola Company"
     - Required for TTB records
     - Can be long string

3. **Fill Optional Fields:**
   - **COLA Number**: TTB approval code
     - Format: "COLA-YYYY-###"
     - Example: "COLA-2024-001"
     - Links to TTB records
   
   - **Approval Date**: When TTB approved
     - Format: YYYY-MM-DD
     - Example: "2024-01-15"

4. **Click "Save Application"**
5. **Verify**: Success toast appears
6. **Check**: Application now in dropdown on refresh

### Example Applications

**Beer:**
```
Brand Name: Samuel Adams Boston Lager
ABV: 5.1
Net Contents: 12 oz
Producer: Boston Beer Company
COLA: COLA-2024-003
Approval Date: 2024-01-10
```

**Wine:**
```
Brand Name: Chateau Margaux
ABV: 13.5
Net Contents: 750 ml
Producer: Chateau Margaux
COLA: COLA-2024-015
```

**Spirit:**
```
Brand Name: Jack Daniel's
ABV: 40.0
Net Contents: 1.75 L
Producer: Jack Daniels Distillery
COLA: COLA-2024-020
```

## Creating Applications via API

### Single Application

```bash
curl -X POST http://localhost:3001/applications \
  -H "Content-Type: application/json" \
  -d '{
    "brandName": "My Brand",
    "alcoholByVolume": 5.5,
    "netContents": "12 oz",
    "producerName": "My Brewery",
    "colaNumber": "COLA-2024-100",
    "approvalDate": "2024-01-01"
  }'

# Response:
{
  "id": "app-12345",
  "brandName": "My Brand",
  "alcoholByVolume": 5.5,
  "netContents": "12 oz",
  "producerName": "My Brewery",
  "colaNumber": "COLA-2024-100",
  "createdAt": "2026-03-08T15:00:00Z"
}
```

### Multiple Applications (Batch)

```bash
curl -X POST http://localhost:3001/applications/batch \
  -H "Content-Type: application/json" \
  -d '{
    "applications": [
      {
        "brandName": "Brand A",
        "alcoholByVolume": 5.5,
        "netContents": "12 oz",
        "producerName": "Brewery A"
      },
      {
        "brandName": "Brand B",
        "alcoholByVolume": 6.0,
        "netContents": "16 oz",
        "producerName": "Brewery B"
      }
    ]
  }'
```

## Batch Upload (Recommended)

### Why Batch Upload?

- ✅ Create 100+ applications at once
- ✅ Less error-prone than manual
- ✅ Can use CSV format (familiar)
- ✅ See all results at once

### CSV Format

```csv
brandName,alcoholByVolume,netContents,producerName,colaNumber,approvalDate
"Brand A",5.5,"12 oz","Brewery A","COLA-2024-001","2024-01-01"
"Brand B",6.0,"16 oz","Brewery B","COLA-2024-002","2024-01-02"
"Brand C",4.8,"12 oz","Brewery C",,  
```

**Column Notes:**
- `brandName`: Required, 100 chars max
- `alcoholByVolume`: Required, 0-100, decimals OK
- `netContents`: Required, must include unit
- `producerName`: Required, 200 chars max
- `colaNumber`: Optional, TTB format
- `approvalDate`: Optional, YYYY-MM-DD format

### Step-by-Step Upload

1. **Prepare CSV file:**
```csv
brandName,alcoholByVolume,netContents,producerName
"My Brand 1",5.5,"12 oz","My Brewery 1"
"My Brand 2",6.2,"16 oz","My Brewery 2"
"My Brand 3",4.9,"12 oz","My Brewery 3"
```

2. **Go to Batch Validation page**

3. **Click "Download Sample CSV"** (to get column headers)

4. **Fill in your data** in CSV format

5. **Drag and drop** or click to select file

6. **System processes:**
   - Validates each row
   - Creates applications
   - Shows results

7. **Download results JSON:**
   - Shows which rows succeeded
   - Which have errors
   - Detailed error messages

### Large Batch Processing

**For 1000+ applications:**

```bash
# Via API is faster
curl -X POST http://localhost:3001/applications/batch \
  -H "Content-Type: application/json" \
  --data "@large-batch.json"
```

Create `large-batch.json`:
```json
{
  "applications": [
    { "brandName": "Brand 1", ... },
    { "brandName": "Brand 2", ... },
    ...
    { "brandName": "Brand 1000", ... }
  ]
}
```

## Searching & Filtering

### Search by COLA Number

```bash
# Get application by COLA number
curl http://localhost:3001/applications/cola/COLA-2024-001

# Response:
{
  "id": "app-coca-cola",
  "brandName": "Coca-Cola",
  "colaNumber": "COLA-2024-001",
  ...
}
```

### List All Applications

```bash
# Get all applications
curl http://localhost:3001/applications

# Returns array of all applications
# Use | jq to filter
curl http://localhost:3001/applications | jq '.[] | select(.alcoholByVolume > 5)'
```

### Filter by Properties

```bash
# Via curl and jq
curl http://localhost:3001/applications | \
  jq '.[] | select(.brandName | contains("Bud"))'

# Shows all brands with "Bud" in name
```

## Updating Applications

### Update Single Application

**Via API:**
```bash
# Update one application
curl -X PUT http://localhost:3001/applications/COLA-2024-001 \
  -H "Content-Type: application/json" \
  -d '{
    "alcoholByVolume": 5.1,  # Changed from 5.2
    "netContents": "12 fl oz"  # Changed from "12 oz"
  }'
```

**Important Notes:**
- Only send fields you want to update
- Brand name usually shouldn't change
- ABV/net contents changes affect validation

## Validation Against Applications

### How Applications Are Used

When you upload a label:

1. **OCR extracts** label data
2. **Application selected** manually or detected
3. **Validation runs:**
   - Compare extracted ABV with application ABV
   - Compare brand name (exact or close match)
   - Compare net contents
   - Compare producer info
4. **Result** shows match/mismatch details

### Setting Up for Validation

1. **Create application** with expected label data
2. **Upload actual label image**
3. **Select the matching application**
4. **System compares** and produces result

### Example Workflow

**Setup:**
```
Create Application:
- Brand: Coca-Cola
- ABV: 5.2
- Net Contents: 12 oz
- Producer: Coca-Cola Co.
```

**Validation:**
```
Upload Label (image of Coca-Cola bottle)
↓
OCR Extracts:
- Brand: Coca-Cola (✅ match)
- ABV: 5.2 (✅ match)
- Net Contents: 12 oz (✅ match)
- Producer: Coca-Cola Company (✅ close match)
↓
Result: ✅ VALID (94% confidence)
```

## Data Import/Export

### Export All Applications

```bash
# Export as JSON
curl http://localhost:3001/applications | jq '.' > applications-backup.json

# Convert to CSV
curl http://localhost:3001/applications | \
  jq -r '.[] | [.brandName, .alcoholByVolume, .netContents, .producerName] | @csv' \
  > applications.csv
```

### Import from Another Source

1. **Get data** from CSV/spreadsheet
2. **Convert to API format** (JSON)
3. **Upload via batch endpoint**

```bash
# Convert CSV to JSON
python3 <<'EOF'
import csv
import json

apps = []
with open('brands.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        apps.append({
            "brandName": row['name'],
            "alcoholByVolume": float(row['abv']),
            "netContents": row['volume'],
            "producerName": row['producer']
        })

with open('batch.json', 'w') as f:
    json.dump({"applications": apps}, f)
EOF

# Then upload
curl -X POST http://localhost:3001/applications/batch \
  -H "Content-Type: application/json" \
  -d @batch.json
```

## Best Practices

### Naming Conventions

- **Brand Names:**
  - Use official product name
  - Include variety/style if relevant
  - Be specific: "Bud Light Lime" not just "Bud"

- **Producer Names:**
  - Use full legal entity name
  - Or commonly known name
  - Be consistent across entries

### ABV Precision

- **Accuracy matters:**
  - Use actual label value
  - Decimal places important (5.0 vs 5.2)
  - Tolerance checks: ±0.5%

- **Common ranges:**
  - Beer: 3.0-7.0%
  - Wine: 10.0-15.0%
  - Spirit: 35.0-50.0%

### Net Contents Format

- **Include unit:**
  - "12 oz" not "12"
  - "750 ml" not "750"
  - "1.75 L" for large bottles

- **Consistency:**
  - Same product always same format
  - "fl oz" vs "oz" - be consistent
  - "ml" or "mL" - pick one

## Troubleshooting

### "Brand name already exists"

Each brand should be unique. If:
- Same brand, different size: Add size to name
  - "Coca-Cola 12oz" vs "Coca-Cola 2L"
- Different variant: Be specific
  - "Bud Light" vs "Bud Light Lime"

### "Invalid ABV"

ABV must be 0-100% and numeric:
- ✅ Valid: 5.5, 5, 40, 12.5
- ❌ Invalid: "5.5%", "5.5 percent", "ABV: 5.5"

### "Net contents missing"

Must include both amount and unit:
- ✅ Valid: "12 oz", "750 ml", "1.75 L"
- ❌ Invalid: "12", "750", "bottle"

## Next Steps

- [**Label Images Guide**](../label-images/index.md) - Upload and validate labels
- [**Testing Guide**](../testing/index.md) - Test with applications
- [**Test Data**](../test-data/index.md) - Use sample data

---

**Back**: [Documentation →](../index.md)
