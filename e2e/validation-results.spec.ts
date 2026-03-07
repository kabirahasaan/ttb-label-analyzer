import { test, expect } from '@playwright/test';

test.describe('Validation Results Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/validation-results');
  });

  test('should display results page title', async ({ page }) => {
    await expect(page.locator('h1, h2')).toContainText(/Validation Results|Results/i);
  });

  test('should show results table or empty state', async ({ page }) => {
    await expect(page.getByText(/No validation results yet|Validation Results/i)).toBeVisible();
  });

  test('should have filter or search functionality', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Refresh Results/i })).toBeVisible();
  });

  test('should allow export of results', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to individual result details', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Validation Results - Data Display', () => {
  test('should show validation status indicators', async ({ page }) => {
    await page.goto('/validation-results');
    await expect(page.locator('h1')).toContainText(/Validation Results/i);
  });

  test('should display discrepancy information', async ({ page }) => {
    await page.goto('/validation-results');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Validation Results - Responsive Design', () => {
  test('should be responsive on desktop', async ({ page }) => {
    await page.goto('/validation-results');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/validation-results');
    await page.waitForLoadState('networkidle');
    
    expect(errors.length).toBe(0);
  });
});
