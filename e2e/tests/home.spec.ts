import { expect, test } from '@playwright/test';
import { goToHomePage } from './helper';

test.describe('Home / Tournaments', () => {
  test('TC1: homepage should display tournaments list', async ({ page }) => {
    await goToHomePage(page);

    // Check header
    await expect(page.getByRole('heading', { name: /Vinci Arena/ })).toBeVisible();
    
    // Check navbar buttons
    await expect(page.getByRole('button', { name: 'Accueil' })).toBeVisible();
    await expect(page.getByRole('button', { name: /S'inscrire|S'inscrire/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connexion' })).toBeVisible();
    
    // Check main content
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('TC2: unauthenticated user should see register and login buttons', async ({ page }) => {
    await goToHomePage(page);

    await expect(page.getByRole('button', { name: /S'inscrire/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connexion' })).toBeVisible();
    
    // Should not see profile button
    const profileBtn = page.getByRole('button', { name: 'Profil' });
    await expect(profileBtn).not.toBeVisible();
  });
});