import { expect, test } from '@playwright/test';

test('sign-in returns to the protected route and loads forecasts from the API', async ({
  page,
}) => {
  await page.goto('/fetch');
  await expect(
    page.getByRole('heading', { name: 'Choose a local user' })
  ).toBeVisible();
  await page.getByRole('button', { name: /Sign in as Sample User/ }).click();
  await expect(page).toHaveURL(/\/fetch$/);
  await expect(
    page.getByRole('heading', { name: 'Weather forecast' })
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'Pleasant', exact: true })
  ).toBeVisible();
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Hello Sample User!' })
  ).toBeVisible();
});

test('basic users get their own identity and cannot access the role-protected API', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Sign in as Basic User/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Hello Basic User!' })
  ).toBeVisible();
  const response = await page.request.get('/api/weatherforecast');
  expect(response.status()).toBe(403);
});
