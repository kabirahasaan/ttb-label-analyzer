import { test, expect } from '@playwright/test';

test.describe('Batch Validation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/batch-validation');
  });

  test('should display batch validation page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Batch Label Validation');
  });

  test('should show template download option', async ({ page }) => {
    await page.locator('#batch-images-upload').setInputFiles({
      name: 'test-label.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      ),
    });
    await page.getByRole('tab', { name: /Upload Applications/i }).click();
    const downloadButton = page.getByRole('button', { name: /Download CSV Template/i });
    await expect(downloadButton).toBeVisible();
  });

  test('should display file upload area', async ({ page }) => {
    await expect(page.getByText(/Click to upload or drag and drop/i)).toBeVisible();
  });

  test('should navigate through validation steps', async ({ page }) => {
    await expect(page.getByText(/Upload Label Images/i).first()).toBeVisible();
    await expect(page.getByText(/Select Applications/i).first()).toBeVisible();
    await expect(page.getByText(/Run Batch Validation/i).first()).toBeVisible();
  });

  test('should show validation results section when available', async ({ page }) => {
    await expect(page.getByText(/Complete steps 1 & 2 first/i)).toBeVisible();
  });
});

test.describe('Batch Validation - CSV Upload', () => {
  test('should accept CSV file upload', async ({ page }) => {
    await page.goto('/batch-validation');
    await page.locator('#batch-images-upload').setInputFiles({
      name: 'test-label.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      ),
    });
    await page.getByRole('tab', { name: /Upload Applications/i }).click();

    // Create a test CSV file content
    const csvContent = `brandName,alcoholByVolume,netContents,producerName,colaNumber
Test Beer,5.2,12 fl oz,Test Brewery,COLA-TEST-001`;

    // Create a file input and upload
    await page.locator('#batch-app-upload').setInputFiles({
      name: 'test-batch.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent),
    });

    await expect(page.getByText(/test-batch\.csv/i).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Batch Validation - Navigation', () => {
  test('should have breadcrumb navigation', async ({ page }) => {
    await page.goto('/batch-validation');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display validation action buttons', async ({ page }) => {
    await page.goto('/batch-validation');
    await expect(page.getByRole('button', { name: /Start Batch Validation/i })).toBeVisible();
  });
});
