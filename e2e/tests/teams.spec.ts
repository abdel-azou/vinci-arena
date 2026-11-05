import { expect, test } from '@playwright/test';
import { loginUser, goToCreateTeamPage, goToTeamsPage } from './helper';
import { faker } from '@faker-js/faker';

test.describe('Teams', () => {
  test.beforeEach(async ({ page }) => {
    await goToTeamsPage(page);
  });

  test('TC1: teams page should be accessible when not logged in', async ({ page }) => {
    await expect(page).toHaveURL(/\/teams$/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('TC2: authenticated user should be able to create a team', async ({
    page,
    request,
  }) => {
    await loginUser(page, request);
    await expect(page).toHaveURL('/');

    // Use UI navigation to avoid race with auth restoration on hard refresh.
    await page.getByRole('button', { name: 'Créer équipe' }).click();
    await expect(page).toHaveURL(/\/create-team$/);

    const teamName = `Team_${faker.string.alphanumeric(6).toUpperCase()}`;
    await page.getByLabel("Nom de l'équipe").fill(teamName);
    await page.getByRole('button', { name: "Créer l'équipe" }).click();

    await expect(page.getByText('Équipe créée avec succès')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('TC3: non-authenticated user should not access create team page', async ({
    page,
  }) => {
    await goToCreateTeamPage(page);

    await expect(page).toHaveURL(/\/login$/);
  });
});