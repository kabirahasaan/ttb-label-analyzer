import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage title and description', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Validate Alcohol Labels in');
    await expect(
      page.getByText(/AI-assisted verification of alcohol beverage labels/i)
    ).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Upload Label/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Batch Validate/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Application Form/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Results/i }).first()).toBeVisible();
  });

  test('should navigate to upload label page', async ({ page }) => {
    await page
      .getByRole('link', { name: /Upload Label/i })
      .first()
      .click();
    await expect(page).toHaveURL('/upload-label');
  });

  test('should navigate to batch validation page', async ({ page }) => {
    await page
      .getByRole('link', { name: /Batch Validate/i })
      .first()
      .click();
    await expect(page).toHaveURL('/batch-validation');
  });

  test('should navigate to application form page', async ({ page }) => {
    await page
      .getByRole('link', { name: /Application Form/i })
      .first()
      .click();
    await expect(page).toHaveURL('/application-form');
  });

  test('should display feature cards', async ({ page }) => {
    await expect(page.getByText(/Scan alcohol beverage labels/i)).toBeVisible();
    await expect(page.getByText(/Enter COLA application data/i)).toBeVisible();
    await expect(page.getByText(/Validate multiple labels/i)).toBeVisible();
  });

  test('should display how it works section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /How it works/i })).toBeVisible();
    await expect(page.getByText(/Four simple steps to complete label validation/i)).toBeVisible();
    await expect(page.getByText(/Review Report/i)).toBeVisible();
  });
});
