---
title: Label Images & UI Testing
layout: default
nav_order: 6
---

# Label Images & UI Testing Guide

Work with label images for validation testing, use test images, and perform comprehensive UI testing.

## Overview

Label images are the source data for validation. The OCR system extracts text and structured data from images, which is then validated against TTB rules and COLA applications.

```
Your Label Image
      ↓
   OCR Extraction
   (Text & Data)
      ↓
 Rule Validation
      ↓
 COLA Comparison
      ↓
  Validation Result
```

## Getting Test Images

### Option 1: Pre-Packaged Test Images (Development)

Located in: `apps/web/public/test-images/`

```bash
# View available images
ls -la apps/web/public/test-images/

# Output:
# beer-label-1.jpg          # Clear beer label
# beer-label-2.jpg          # Valid beer label
# wine-label-1.jpg          # Clear wine label
# wine-label-2.jpg          # Valid wine label
# spirit-label-1.jpg        # Clear spirit label
# spirit-label-2.jpg        # Valid spirit label
# edge-case-blurry.jpg      # Low OCR confidence
# edge-case-rotated.jpg     # Image rotated 90°
# invalid-foreign.jpg       # Foreign text
# invalid-no-warning.jpg    # Missing gov warning
# misc-test-1.jpg           # General test image
# misc-test-2.jpg           # General test image
```

### Option 2: Download from Docs

Test images also in: `docs/test-images/`

```bash
# Find all test images
find docs/test-images -name "*.jpg" -o -name "*.png"

# Use in UI:
# Upload Label → Select File → Choose from docs/test-images/
```

### Option 3: Use Real Label Photos

**Requirements:**

- Format: JPG, PNG, or WebP
- Size: 300x400 pixels minimum (max 10 MB)
- Quality:
  - Clear text (readable)
  - Good lighting
  - Straight angle (not rotated)
  - Complete label visible
  - High contrast

**How to prepare:**

```bash
# Resize image to standard size
identify input.jpg  # Check dimensions
convert input.jpg -resize 800x600 label-resized.jpg

# Compress if too large
convert label-resized.jpg -quality 85 label-final.jpg

# Use in upload
```

### Option 4: Create Synthetic Test Images

**For edge case testing:**

```bash
# Create blurry image
convert test-label.jpg -blur 0x2 blurry-label.jpg

# Create low contrast
convert test-label.jpg -modulate 100,50 low-contrast.jpg

# Rotate 45 degrees
convert test-label.jpg -rotate 45 rotated-label.jpg

# Darken (poor lighting)
convert test-label.jpg -brightness-contrast -20x10 dark-label.jpg
```

## Using Test Images in Development

### Development Environment

```bash
# 1. API running
pnpm nx run api:serve

# 2. Web app running
pnpm nx run web:serve

# 3. Open browser
open http://localhost:3000/upload-label
```

### Upload Flow

1. **Go to "Upload Label" page**
2. **Create test application** (if not using pre-seeded):
   - Brand: "Test Beer"
   - ABV: 5.5
   - Producer: "Test Brewery"
   - Save

3. **Upload image:**
   - Click "Select Image"
   - Choose from: `apps/web/public/test-images/`
   - Or drag-and-drop

4. **System processes:**
   - OCR extracts data
   - Rules validation
   - COLA cross-check
   - Generates result

5. **View result:**
   - Status badge (Valid/Warning/Error)
   - Confidence score
   - Extracted data (what OCR found)
   - Rule check details
   - Click to expand details

### Quick Test Scenarios

**Test 1: Clear Valid Label**

```
Image: beer-label-1.jpg
Application: Samuel Adams
Expected: ✅ Valid (90%+ confidence)
Time: 2-5 seconds
```

**Test 2: Minor Issues**

```
Image: edge-case-rotated.jpg
Application: Samuel Adams
Expected: ⚠️ Warning (70-85% confidence)
Issues: Rotated, harder to read
```

**Test 3: Major Problems**

```
Image: invalid-no-warning.jpg
Application: Samuel Adams
Expected: ❌ Error (<70% confidence)
Issues: Missing government warning
```

## Using Test Images in Production

### Before Upload

**Note**: Pre-packaged test images not deployed to production.

**Instead, use:**

1. Download test images from GitHub repo
2. Use any real label photo
3. Use professional product images

### Upload Process Same

```
Production URL: https://ttb-label-analyzer.vercel.app

Same workflow:
1. Go to Upload Label
2. Select application
3. Upload image
4. Get result
```

### Expected Performance

| Metric     | Target  | Typical  |
| ---------- | ------- | -------- |
| Upload     | <5 sec  | 1-3 sec  |
| OCR        | <10 sec | 2-5 sec  |
| Validation | <5 sec  | 1-2 sec  |
| **Total**  | <15 sec | 5-10 sec |

## Batch Label Validation

### Upload Multiple Labels

1. **Go to "Batch Validation"**
2. **Prepare CSV:**

```csv
brandName,alcoholByVolume,netContents,producerName,labelImageUrl
"Brand A",5.5,"12 oz","Brewery A","https://example.com/label-a.jpg"
"Brand B",6.0,"16 oz","Brewery B","https://example.com/label-b.jpg"
```

3. **Upload CSV**
4. **System processes:**
   - One validation per row
   - Parallel processing
   - Aggregated results

5. **Download results** as JSON

### CSV Format for Batch

```csv
brandName,alcoholByVolume,netContents,producerName
"Beer Brand 1",5.5,"12 oz","Brewery 1"
"Beer Brand 2",6.0,"16 oz","Brewery 2"
"Wine Brand 1",12.5,"750 ml","Vineyard 1"
```

Required columns:

- `brandName`: Product name
- `alcoholByVolume`: ABV percentage
- `netContents`: With unit (oz, ml, etc.)
- `producerName`: Manufacturer

## UI Testing Guide

### Manual Testing Workflow

#### 1. Navigation Testing

**Test all menu items:**

```
Home Page
└─ Upload Label ✓
└─ Batch Validation ✓
└─ Application Form ✓
└─ Validation Results ✓
└─ Footer Links
   └─ Documentation ✓
   └─ API Reference ✓
   └─ Privacy ✓
   └─ Terms ✓
```

**Check:**

- All links work (no 404s)
- Pages load quickly (<2 sec)
- Navigation works on mobile

#### 2. Upload Label Testing

**Positive Case:**

```
✓ Upload valid image
✓ System shows progress
✓ Result displays correctly
✓ Can download results
✓ Can validate again
```

**Negative Cases:**

```
✓ Upload invalid file (non-image) → error message
✓ Upload giant file (>10MB) → error message
✓ Upload unsupported format → error message
```

**Edge Cases:**

```
✓ Upload blurry image → low confidence warning
✓ Upload rotated image → still processes
✓ Upload foreign text → handles gracefully
```

#### 3. Application Form Testing

**Create Application:**

```
✓ Fill all required fields
✓ Save application
✓ Toast confirmation
✓ Application appears in dropdown
✓ Can select in validation
```

**Validation:**

```
✓ Brand name required
✓ ABV must be 0-100
✓ Cannot submit with errors
✓ Error messages clear
```

**Batch Upload CSV:**

```
✓ Download sample CSV
✓ Fill sample CSV
✓ Upload processes correctly
✓ Results show successes
✓ Results show errors
```

#### 4. Validation Results Testing

**List Results:**

```
✓ Results load on page open
✓ Shows all past validations
✓ Results paginated (if many)
✓ Can sort/filter
✓ Can export results
```

**Result Details:**

```
✓ Click result to expand
✓ Shows extracted data
✓ Shows rule checks
✓ Shows COLA comparison
✓ Shows confidence score
```

#### 5. Performance Testing

**Page Load:**

```
✓ Home page loads <2 seconds
✓ Upload page loads <2 seconds
✓ Results page loads <3 seconds
✓ No layout shift
✓ Images lazy-loaded
```

**Image Upload:**

```
✓ Can upload 1 MB image
✓ Can upload 10 MB image
✓ Progress shows accurately
✓ Cancel works mid-upload
```

**Validation Speed:**

```
✓ Simple validation <5 sec
✓ Complex validation <10 sec
✓ Progress indicator updates
✓ Results appear immediately
```

### Automated UI Testing (Playwright)

Run end-to-end tests:

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test
pnpm test:e2e upload-label.spec.ts

# Run with browser visible
pnpm test:e2e --headed

# Debug mode
pnpm test:e2e --debug
```

**Test locations:** `e2e/*.spec.ts`

Key test files:

- `upload-label.spec.ts` - Image upload workflow
- `batch-validation.spec.ts` - Batch processing
- `validation-results.spec.ts` - Results viewing
- `homepage.spec.ts` - Navigation

### Browser DevTools Testing

**Check Console (F12):**

```javascript
// Should see no red errors
// Check for warnings about API connectivity

// Verify API URL is correct
console.log(process.env.NEXT_PUBLIC_API_URL);
```

**Check Network Tab:**

```
1. Open DevTools (F12) → Network
2. Reload page
3. Review requests:
   - Status codes (200 OK)
   - No 404s or 500s
   - Response times <500ms
   - Payload sizes reasonable
```

**Check Performance:**

```
1. DevTools → Lighthouse
2. Run audit
3. Check scores:
   - Performance: >90
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >90
```

### Mobile Testing

**Responsive Design:**

```
✓ Test on mobile (375px width)
✓ Test on tablet (768px width)
✓ Test on desktop (1024px width)
✓ Buttons clickable on touch
✓ No horizontal scroll
```

**Mobile DevTools:**

```
DevTools → Device Emulation
✓ iPhone 14 Pro
✓ iPad
✓ Android phone
✓ Throttle network (slow 3G)
✓ Test on actual devices if possible
```

## Testing Checklist

### Before Release

- ✅ All UI pages accessible
- ✅ No console errors
- ✅ Upload flow works (all file types)
- ✅ Validation completes successfully
- ✅ Results display correctly
- ✅ Batch processing works
- ✅ Navigation works (all links)
- ✅ Footer links functional
- ✅ API connectivity verified
- ✅ Mobile responsive
- ✅ Performance acceptable (<3 sec load)
- ✅ Error messages helpful
- ✅ Can download results
- ✅ Data persists (refresh and reload)

### Test Data Used

| Test        | Image              | Application  | Expected      |
| ----------- | ------------------ | ------------ | ------------- |
| Valid       | beer-label-1.jpg   | Samuel Adams | ✅ Valid      |
| Warning     | edge-case-blurry   | Bud Light    | ⚠️ Warning    |
| Error       | invalid-no-warning | Heineken     | ❌ Error      |
| Missing App | any image          | None/new     | ⚠️ Warning    |
| Batch       | CSV                | Multiple     | Mixed results |

## Troubleshooting UI Issues

### Image Won't Upload

**Check:**

1. File size < 10 MB
2. Format is JPG/PNG/WebP
3. File exists and readable
4. Browser console for errors

**Fix:**

```bash
# Resize if too large
convert large.jpg -resize 800x600 small.jpg

# Convert format
convert image.webp image.jpg
```

### Validation Takes Too Long

**Check:**

1. API logs for OCR processing
2. Image quality (blurry = slower)
3. Network latency

**Fix:**

- Use clearer image
- Check API performance
- Restart if stuck

### Results Don't Load

**Check:**

1. API returning results
2. Database has data
3. Network requests successful

**Fix:**

```bash
curl http://localhost:3001/validate/results | jq '.'
```

### Navigation Broken

**Check:**

1. All route files exist
2. Next.js links use correct paths
3. No typos in URLs

**Fix:**

```bash
pnpm build:web  # Verify build succeeds
```

## Next Steps

- [**Testing Guide**](../testing/index.md) - Full testing procedures
- [**Test Data**](../test-data/index.md) - Sample data details
- [**API Docs (Production)**](https://ttb-label-analyzer-production.up.railway.app/api/docs) - API endpoint documentation

---

**Back**: [Documentation →](../index.md)
