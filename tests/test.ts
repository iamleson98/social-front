import { expect, test } from '@playwright/test';

test('lab page has expected h1', async ({ page }) => {
	await page.goto('/lab');
	await expect(page.getByRole('heading', { name: 'Lab page' })).toBeVisible();
});
