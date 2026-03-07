# Test Label Images & Testing Guide

This directory contains placeholder references for test label images and comprehensive testing scenarios for the TTB Label Compliance Validation Platform.

## 🎯 Quick Start Testing

The application is pre-seeded with **15 test applications** covering all stakeholder scenarios. You can test immediately by:

1. **Upload any image** (placeholder/screenshot is fine - OCR not required for current testing)
2. **Select or enter application data** from the scenarios below
3. **Run validation** to see different outcomes

## 📋 Test Application Scenarios

### ✅ PERFECT MATCH - Positive Validation Scenarios

These should **PASS** all validation checks:

| COLA Number   | Brand Name                 | ABV   | Net Contents      | Producer               | Use Case                   |
| ------------- | -------------------------- | ----- | ----------------- | ---------------------- | -------------------------- |
| COLA-2024-001 | Hoppy Trails IPA           | 6.5%  | 12 fl oz (355 mL) | Mountain View Brewery  | Standard craft beer        |
| COLA-2024-002 | Reserve Cabernet Sauvignon | 13.5% | 750 mL            | Valley Vineyards       | Premium wine with sulfites |
| COLA-2024-003 | Kentucky Oak Bourbon       | 42.0% | 750 mL            | Heritage Distillery Co | High-ABV spirit testing    |
| COLA-2024-004 | Lite Golden Lager          | 4.2%  | 12 fl oz (355 mL) | Sunrise Brewing Co     | Light beer, lower ABV      |
| COLA-2024-005 | Orchard Select Hard Cider  | 5.8%  | 12 fl oz (355 mL) | Apple Valley Cidery    | Cider category, allergen   |

**Expected Result:** ✓ All validations pass, "Compliant" status

---

### ⚠️ EDGE CASES - Boundary Testing Scenarios

These test limits and unusual but valid configurations:

| COLA Number   | Brand Name      | ABV   | Net Contents      | Producer          | Edge Case Type         |
| ------------- | --------------- | ----- | ----------------- | ----------------- | ---------------------- |
| COLA-2024-100 | Session IPA     | 3.0%  | 12 fl oz (355 mL) | Modern Brewing Co | Minimum ABV boundary   |
| COLA-2024-101 | Imperial Stout  | 12.0% | 12 fl oz (355 mL) | Bold Brewing Co   | Maximum standard ABV   |
| COLA-2024-102 | Special Reserve | 7.5%  | 500 mL            | Artisan Brewers   | Unusual container size |
| COLA-2026-200 | New Release Ale | 6.8%  | 16 fl oz (473 mL) | Frontier Brewing  | Very recent approval   |

**Expected Result:** ⚠️ May trigger warnings but should pass validation

---

### ❌ NEGATIVE TESTS - Error & Warning Scenarios

These should **FAIL** or produce **WARNINGS**:

| COLA Number        | Brand Name        | ABV   | Net Contents      | Producer              | Issue Type                |
| ------------------ | ----------------- | ----- | ----------------- | --------------------- | ------------------------- |
| COLA-INVALID-001   | Near Beer Light   | 0.5%  | 12 fl oz (355 mL) | Low Alcohol Beverages | ABV below TTB threshold   |
| COLA-INVALID-002   | Extreme Spirit    | 95.0% | 750 mL            | Maximum Spirits Inc   | ABV unrealistically high  |
| _(no COLA number)_ | Unlabeled Product | 5.5%  | 12 fl oz (355 mL) | Generic Brewery       | Missing COLA identifier   |
| COLA-2010-999      | Old Timer Ale     | 5.5%  | 12 fl oz (355 mL) | Old Brewery           | Very old/expired approval |

**Expected Result:** ✗ Non-Compliant or ⚠️ Warning status

---

### 🧪 TOLERANCE TESTING - Acceptable Variance

| COLA Number       | Brand Name       | ABV  | Net Contents      | Producer              | Variance Test            |
| ----------------- | ---------------- | ---- | ----------------- | --------------------- | ------------------------ |
| COLA-2024-001-VAR | Hoppy Trails IPA | 6.3% | 12 fl oz (355 mL) | Mountain View Brewery | 0.2% ABV difference (OK) |

**Expected Result:** ⚠️ Warning but passes (within 0.3% tolerance)

---

## 🧪 Manual Testing Workflows

### Test 1: Perfect Match Validation ✅

**Objective:** Verify compliant label passes all checks

1. Navigate to "Validate Label" page
2. Upload any test image
3. Select `COLA-2024-001` from dropdown OR enter manually:
   - Brand Name: `Hoppy Trails IPA`
   - ABV: `6.5`
   - Net Contents: `12 fl oz (355 mL)`
   - Producer: `Mountain View Brewery`
4. Click "Run Validation"
5. **Expected:** ✓ "Compliant" status, no discrepancies, validation time displayed

---

### Test 2: Brand Name Mismatch ❌

**Objective:** Detect brand name discrepancy

1. Upload any image
2. Select `COLA-2024-001`
3. **Manually override** Brand Name to: `Different IPA Name`
4. Run validation
5. **Expected:** ❌ Discrepancy detected: "Brand Name mismatch"

---

### Test 3: ABV Tolerance (Within Range) ⚠️

**Objective:** Verify tolerance acceptance

1. Upload any image
2. Select `COLA-2024-001` (6.5% ABV)
3. **Override** ABV to: `6.3` (0.2% difference)
4. Run validation
5. **Expected:** ⚠️ Warning but passes (within 0.3% tolerance)

---

### Test 4: ABV Tolerance (Outside Range) ❌

**Objective:** Verify tolerance rejection

1. Upload any image
2. Select `COLA-2024-001` (6.5% ABV)
3. **Override** ABV to: `7.2` (0.7% difference)
4. Run validation
5. **Expected:** ❌ "Non-Compliant" - exceeds tolerance

---

### Test 5: High-ABV Spirit Validation 🥃

**Objective:** Test spirit category handling

1. Upload any image
2. Select `COLA-2024-003` (Kentucky Oak Bourbon)
3. Verify all fields match:
   - Brand: `Kentucky Oak Bourbon`
   - ABV: `42.0`
   - Contents: `750 mL`
   - Producer: `Heritage Distillery Co.`
4. Run validation
5. **Expected:** ✓ Passes with high ABV (spirits allowed)

---

### Test 6: Edge Case - Minimum ABV ⚠️

**Objective:** Boundary testing

1. Upload any image
2. Select `COLA-2024-100` (Session IPA)
3. Verify ABV: `3.0%` (minimum for beer)
4. Run validation
5. **Expected:** Edge case handling, possible warning

---

### Test 7: Missing COLA Number ❌

**Objective:** Required field validation

1. Upload any image
2. Select the application with no COLA number
3. Attempt validation
4. **Expected:** Error or warning about missing identifier

---

### Test 8: Performance Metrics 🚀

**Objective:** Verify validation speed

1. Complete any validation scenario
2. Check results section
3. **Expected:** "Validation Time" displayed (typically < 2s = "Lightning fast")

---

## 📂 Correlated Test Images

The test image files now follow this naming convention:

`<COLA-ID>-<scenario-short-description>.svg`

Examples:

- `COLA-2024-001-positive-perfect-match.svg`
- `COLA-2024-001-negative-missing-govt-warning.svg`
- `NO-COLA-negative-missing-cola-id.svg`

### Available Correlated Scenario Images

#### Positive scenarios

- `COLA-2024-001-positive-perfect-match.svg`
- `COLA-2024-002-positive-perfect-match.svg`
- `COLA-2024-003-positive-perfect-match.svg`
- `COLA-2024-004-positive-perfect-match.svg`
- `COLA-2024-005-positive-perfect-match.svg`

#### Edge scenario

- `COLA-2024-100-edge-min-abv-boundary.svg`

#### Negative scenarios

- `COLA-2024-001-negative-missing-govt-warning.svg`
- `COLA-2024-001-negative-incomplete-information.svg`
- `COLA-INVALID-001-negative-abv-too-low.svg`
- `COLA-INVALID-002-negative-abv-too-high.svg`
- `COLA-2010-999-negative-expired-approval.svg`
- `NO-COLA-negative-missing-cola-id.svg`

### How to use these images

1. Go to Validate Label page
2. Upload one of the files above
3. Select the matching seeded application (same COLA ID)
4. Run validation and verify expected positive/negative behavior

These files are intentionally crafted to simulate real-world scenarios like missing government warning and incomplete required information.

---

## 📊 Expected Validation Performance

Based on stakeholder requirements:

- **Target:** < 2 seconds per validation
- **Performance Indicators:**
  - < 2s = ⚡ "Lightning fast"
  - 2-5s = ✓ "Excellent performance"
  - \> 5s = "Completed"

---

## 🔍 Validation Rules Reference

### Required Fields

All labels must include:

- Brand Name
- Alcohol By Volume (ABV)
- Net Contents
- Producer Name
- Government Warning (beer/wine/spirits)

### Cross-Check Rules

- **Brand Name:** Must match exactly (case-insensitive)
- **ABV:** Must be within ±0.3% tolerance
- **Net Contents:** Must match specified size
- **Producer:** Must match approved producer

### Edge Cases

- Beer: 3.0% - 12.0% ABV typical range
- Wine: 7.0% - 24.0% ABV typical range
- Spirits: 20.0% - 95.0% ABV typical range

---

## 🚀 Stakeholder Interview Scenarios Covered

This test data covers all scenarios identified in stakeholder interviews:

✅ **Compliant Labels** - Perfect matches for positive testing  
✅ **Brand Discrepancies** - Name mismatches  
✅ **ABV Variances** - Both within and outside tolerance  
✅ **Container Size Issues** - Size mismatches  
✅ **Producer Verification** - Unauthorized producers  
✅ **Missing Information** - Incomplete applications  
✅ **Edge Cases** - Boundary conditions (min/max ABV, unusual sizes)  
✅ **Expired Approvals** - Old COLA numbers  
✅ **Category Testing** - Beer, wine, spirits, cider  
✅ **Performance Validation** - Speed metrics display

---

## 📝 Notes for Developers

- Test data auto-seeds on API startup (see `/libs/test-data-generator/test-data/applications.json`)
- In-memory storage resets on server restart
- All 15 test scenarios available via dropdown in UI
- Validation timing captured with `performance.now()` precision
- Results stored for "Results" page viewing

---

## 🔗 Related Documentation

- [Test Data Guide](../../../../docs/TEST_DATA.md)
- [Testing Strategy](../../../../docs/TESTING.md)
- [Architecture](../../../../docs/ARCHITECTURE.md)
