import { test, expect } from '@playwright/test';

test.describe('Public & Auth Surface Smoke Verification', () => {
  test('homepage renders core hero headline and branding', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kshatriya Matrimonial Society/);
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('login page has email and password inputs with accessible labels', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.getByLabel(/email|mobile/i);
    await expect(emailInput).toBeVisible();
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
    const submitBtn = page.getByRole('button', { name: /sign in/i });
    await expect(submitBtn).toBeVisible();
  });

  test('registration page enforces legal consent checkboxes', async ({ page }) => {
    await page.goto('/register');
    const termsCheck = page.getByRole('checkbox', { name: /terms of use/i });
    await expect(termsCheck).toBeVisible();
    const privacyCheck = page.getByRole('checkbox', { name: /privacy policy/i });
    await expect(privacyCheck).toBeVisible();
  });

  test('unauthenticated visitor to dashboard is redirected to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
