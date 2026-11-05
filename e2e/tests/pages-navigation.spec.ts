import { expect, test } from '@playwright/test';
import {
  createRegisteredUser,
  goToHomePage,
  goToLoginPage,
  goToRegisterPage,
  loginWith,
} from './helper';

test.describe('Pages navigation', () => {
  test('TC-PAGES-1: should open key public pages', async ({ page }) => {
    await goToHomePage(page);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connexion' })).toBeVisible();

    await goToRegisterPage(page);
    await expect(page.getByRole('heading', { name: 'Inscription' })).toBeVisible();

    await goToLoginPage(page);
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('TC-PAGES-2: should open key authenticated pages', async ({
    page,
    request,
  }) => {
    const user = await createRegisteredUser(request);

    await goToLoginPage(page);
    await loginWith(page, user.email, user.password);
    await expect(page).toHaveURL('/');

    await page.getByRole('button', { name: 'Profil' }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(
      page.getByRole('heading', { name: /Mon profil|Profil/ }),
    ).toBeVisible();

    await page.getByRole('button', { name: /Ma Team|Chercher une Team/ }).click();
    await expect(page).toHaveURL(/\/(team|teams)$/);

    await page.getByRole('button', { name: 'Accueil' }).click();
    await expect(page).toHaveURL('/');
  });
});
