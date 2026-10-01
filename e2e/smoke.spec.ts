import { test, expect } from '@playwright/test';

test.describe('Alapvető megjelenés és fülek (Smoke)', () => {
  test('A főoldal sikeresen betölt és a cím helyes', async ({ page, isMobile }) => {
    await page.goto('/');

    // Check title in document
    await expect(page).toHaveTitle(/Csupaszív Kalandok/i);

    // On desktop, the header title is visible
    if (!isMobile) {
      const desktopTitle = page.locator('h1').filter({ hasText: /Csupaszív Kalandok/i }).first();
      await expect(desktopTitle).toBeVisible();
    }
  });

  test('Fülek közötti váltás működik', async ({ page }) => {
    await page.goto('/');

    // Navigate to Jutalmak tab
    const dashboardTab = page.getByRole('button', { name: /Jutalmak/i }).first();
    await expect(dashboardTab).toBeVisible();
    await dashboardTab.click();
    await expect(page.getByRole('button', { name: /Díszes Oklevél|Megtekintés/i }).first()).toBeVisible();

    // Navigate to Beállítások tab
    const settingsTab = page.getByRole('button', { name: /Beállítások/i }).first();
    await expect(settingsTab).toBeVisible();
    await settingsTab.click();
    await expect(page.getByText(/Nyelv|Hangok/i).first()).toBeVisible();
  });
});
