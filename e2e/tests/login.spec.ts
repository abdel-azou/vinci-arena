import { expect, test } from '@playwright/test';
import { goToLoginPage, loginWith, createRegisteredUser } from './helper';

test.describe('Login / Logout', () => {
  test.beforeEach(async ({ page }) => {
    await goToLoginPage(page);
  });

  test('TC1.1: successful login with valid credentials should redirect to homepage', async ({
    page,
    request,
  }) => {
    const user = await createRegisteredUser(request);
    await loginWith(page, user.email, user.password);

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Tournois' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Déconnexion' })).toBeVisible();
  });

  test('TC2.1: failed login with wrong password should show error message', async ({
    page,
    request,
  }) => {
    const user = await createRegisteredUser(request);
    await loginWith(page, user.email, 'wrong-password');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('TC2.2: failed login with unknown email should show error message', async ({
    page,
  }) => {
    await loginWith(page, 'unknown@mail.com', 'any-password');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
  });

  test('TC3.1: logout after login should clear session and show login button', async ({
    page,
    request,
  }) => {
    const user = await createRegisteredUser(request);
    await loginWith(page, user.email, user.password);

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Déconnexion' })).toBeVisible();

    await page.getByRole('button', { name: 'Déconnexion' }).click();
    
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Connexion' })).toBeVisible();
  });
});
