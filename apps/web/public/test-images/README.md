# Test Label Images

This directory contains placeholder references for test label images used in validation scenarios.

## Image Placeholders

The application references the following test images:

### Matching Scenarios (Valid Labels)

- `hoppy-trails-ipa.jpg` - Matches COLA-2024-001
- `reserve-cabernet.jpg` - Matches COLA-2024-002
- `kentucky-oak-bourbon.jpg` - Matches COLA-2024-003

### Mismatch Scenarios (Invalid Labels)

- `different-brand.jpg` - Brand name mismatch
- `wrong-abv.jpg` - ABV exceeds tolerance
- `wrong-size.jpg` - Container size mismatch
- `wrong-producer.jpg` - Producer name mismatch
- `missing-warning.jpg` - Missing required warning

### Partial Match Scenarios

- `minor-abv-diff.jpg` - ABV within acceptable tolerance
- `alt-brand-format.jpg` - Alternative brand name format

## Using Test Images

### Option 1: Add Sample Images

Place actual label images in this directory with the filenames above. Images should show:

- Brand name prominently displayed
- ABV percentage
- Container size/net contents
- Producer information
- Warning statements

### Option 2: Use Any Image for Testing

Since the application currently requires manual data entry:

1. Upload any image file (doesn't need to be an actual label)
2. Manually enter the test data from the fixtures
3. Run validation

The validation logic compares the entered/extracted data against the application data, not the actual image content (until OCR is implemented).

## Recommended Image Specifications

- Format: JPG or PNG
- Size: 800x600 to 1200x900 pixels
- Resolution: 72-150 DPI
- Clear, well-lit label photography
- Text should be legible

## Future Integration

When OCR/image processing is implemented:

- Replace these placeholders with actual label images
- Ensure text matches the fixture data exactly
- Use high-contrast images for better OCR accuracy
- Include both front and back label images if needed
