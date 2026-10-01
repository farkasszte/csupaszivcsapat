import { test, expect } from '@playwright/test';

test.describe('Díszoklevél panel és folyamat', () => {
  test('Oklevél megnyitása a Jutalom panelből, kitöltése és bezárása', async ({ page }) => {
    await page.goto('/');

    // 1. Open Jutalmak tab
    const dashboardTab = page.getByRole('button', { name: /Jutalmak/i }).first();
    await expect(dashboardTab).toBeVisible();
    await dashboardTab.click();

    // 2. Click "Díszes Oklevél" button
    const certButton = page.getByRole('button', { name: /Díszes Oklevél|Megtekintés/i }).first();
    await expect(certButton).toBeVisible();
    await certButton.click();

    // 3. Verify Certificate Panel is open
    const certHeading = page.getByRole('heading', { name: 'DÍSZOKLEVÉL' });
    await expect(certHeading).toBeVisible();

    // 4. Verify rank card is visible with Kiérdemelt rangod
    await expect(page.getByText('Kiérdemelt rangod', { exact: false })).toBeVisible();

    // 5. Verify name input card and type a player name
    const nameInput = page.getByPlaceholder(/Írd be a teljes neved/i);
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Teszt Elek Hős');
    await expect(nameInput).toHaveValue('Teszt Elek Hős');

    // 6. Verify PNG download button is present
    const downloadBtn = page.getByRole('button', { name: /Oklevél letöltése/i });
    await expect(downloadBtn).toBeVisible();

    // 7. Verify floating close button or bottom button exists and closes the panel
    const closeBtn = page.getByRole('button', { name: /Bezárás/i }).first();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // 8. Verify certificate panel closed and dashboard is back
    await expect(certHeading).not.toBeVisible();
    await expect(certButton).toBeVisible();
  });
});
