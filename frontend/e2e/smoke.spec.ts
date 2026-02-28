import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login');

    // The login card should be visible
    await expect(page.locator('form')).toBeVisible();

    // Card title should show "TBO Dashboard"
    await expect(page.getByText('TBO Dashboard')).toBeVisible();

    // Card description should show the login prompt
    await expect(page.getByText('Entre com suas credenciais')).toBeVisible();
  });

  test('unauthenticated users get redirected to /login', async ({ page }) => {
    await page.goto('/projetos');

    // Should be redirected to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('login form has email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Email input
    const emailInput = page.locator('input#email');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('type', 'email');

    // Password input
    const passwordInput = page.locator('input#password');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Submit button
    const submitButton = page.getByRole('button', { name: 'Entrar' });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('page title is correct', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle('TBO Dashboard');
  });
});
