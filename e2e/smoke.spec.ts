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

  test('Felolvasás kapcsoló és Bemutató mód működése', async ({ page, isMobile }) => {
    await page.goto('/');

    const readAloudSelector = isMobile ? page.getByTestId('mobile-read-aloud') : page.getByTestId('header-read-aloud');

    // 1. By default, TTS button is not present
    await expect(readAloudSelector).toHaveCount(0);

    // 2. Open Settings tab
    const settingsTab = page.getByRole('button', { name: /Beállítások/i }).first();
    await settingsTab.click();

    // 3. Verify Presentation Mode does not contain the word "Kioszk"
    await expect(page.getByText('Bemutató mód')).toBeVisible();
    await expect(page.getByText(/kioszk/i)).toHaveCount(0);

    // 4. Verify Read Aloud toggle exists
    const ttsToggle = page.getByTestId('toggle-read-aloud');
    const presentationToggle = page.getByTestId('toggle-presentation-mode');
    await expect(ttsToggle).toBeVisible();

    // 5. Turn on TTS manually
    await ttsToggle.click();
    await settingsTab.click(); // close panel
    await expect(readAloudSelector).toBeVisible();

    // 6. Turn off TTS manually
    await settingsTab.click();
    await ttsToggle.click();
    await settingsTab.click();
    await expect(readAloudSelector).toHaveCount(0);

    // 7. Enabling presentation mode automatically turns on TTS
    await settingsTab.click();
    await presentationToggle.click();
    await settingsTab.click();
    await expect(readAloudSelector).toBeVisible();

    // 8. Can still manually turn off TTS while presentation mode is active
    await settingsTab.click();
    await ttsToggle.click();
    await settingsTab.click();
    await expect(readAloudSelector).toHaveCount(0);
  });
});
