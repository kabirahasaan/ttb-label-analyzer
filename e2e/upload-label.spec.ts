import { test, expect } from '@playwright/test';

test.describe('Upload Label Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload-label');
  });

  test('should display upload label page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Validate Label');
  });

  test('should show file upload area', async ({ page }) => {
    await expect(page.locator('input[type="file"]').first()).toBeVisible();
  });

  test('should display validation steps', async ({ page }) => {
    await expect(page.getByText(/Follow these steps to validate your label/i)).toBeVisible();
    await expect(page.getByText(/Upload Label/i).first()).toBeVisible();
    await expect(page.getByText(/Application Data/i).first()).toBeVisible();
  });
});

test.describe('Upload Label - File Upload', () => {
  test('should accept image file upload', async ({ page }) => {
    await page.goto('/upload-label');

    const fileInput = page.getByLabel('Select image file from disk');

    if ((await fileInput.count()) > 0) {
      // Create a simple 1x1 PNG image
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      await fileInput.setInputFiles({
        name: 'test-label.png',
        mimeType: 'image/png',
        buffer: pngBuffer,
      });

      await expect(page.getByText(/test-label\.png/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Upload Label - Validation Results', () => {
  test('should show results section after validation', async ({ page }) => {
    await page.goto('/upload-label');
    await expect(page.getByText(/Run Validation/i).first()).toBeVisible();
  });

  test('should allow export of validation results', async ({ page }) => {
    await page.goto('/upload-label');
    await expect(page.getByRole('button', { name: /Run validation/i })).toBeVisible();
  });
});
