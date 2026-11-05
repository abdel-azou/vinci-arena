import { APIRequestContext, expect, Page } from '@playwright/test';
import { faker } from '@faker-js/faker';


// Navigation helpers
export const goToLoginPage = async (page: Page) => {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
};

export const goToRegisterPage = async (page: Page) => {
  await page.goto('/register');
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole('heading', { name: 'Inscription' })).toBeVisible();
};

export const goToHomePage = async (page: Page) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
};

export const goToTeamsPage = async (page: Page) => {
  await page.goto('/teams');
  await expect(page).toHaveURL(/\/teams$/);
};

export const goToCreateTeamPage = async (page: Page) => {
  await page.goto('/create-team');
};

// Auth helpers
export const loginWith = async (
  page: Page,
  email: string,
  password: string,
) => {
  const emailInput = page.getByLabel('Email');
  const passwordInput = page.getByLabel('Mot de passe');
  const submitButton = page.getByRole('button', { name: 'Entrer' });

  await expect(emailInput).toBeVisible({ timeout: 5000 });
  await expect(passwordInput).toBeVisible({ timeout: 5000 });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();
};

export const logout = async (page: Page) => {
  await page.getByRole('button', { name: 'Déconnexion' }).click();
  await expect(page.getByRole('button', { name: 'Connexion' })).toBeVisible();
};

export const loginAs = async (
  page: Page,
  email: string,
  password: string,
) => {
  await goToLoginPage(page);
  await loginWith(page, email, password);
  await expect(page).toHaveURL('/');
};

export const createTeamFromNavbar = async (page: Page, teamName: string) => {
  await page.getByRole('button', { name: 'Créer équipe' }).click();
  await expect(page).toHaveURL(/\/create-team$/);
  await page.getByLabel("Nom de l'équipe").fill(teamName);
  await page.getByRole('button', { name: "Créer l'équipe" }).click();
  await expect(page.getByText('Équipe créée avec succès')).toBeVisible();
  await expect(page).toHaveURL('/');
};

export const sendJoinRequestToTeam = async (page: Page, teamName: string) => {
  await goToTeamsPage(page);
  await page.waitForLoadState('networkidle');

  const teamHeading = page.getByRole('heading', {
    name: teamName,
    exact: true,
  });
  await expect(teamHeading).toBeVisible({ timeout: 5000 });

  // Anchor the action to the card containing the exact team heading.
  const joinButton = page.locator(
    `xpath=//h5[normalize-space()="${teamName}"]/ancestor::div[contains(@class,"MuiCard-root")]//button[normalize-space()="Rejoindre" or normalize-space()="Demander à rejoindre"]`,
  );

  await expect(joinButton).toBeVisible({ timeout: 5000 });
  await expect(joinButton).toBeEnabled({ timeout: 5000 });
  await joinButton.click();

  await expect(
    page.getByText('Demande envoyée ! En attente de validation par le responsable.'),
  ).toBeVisible({ timeout: 5000 });
};

export const clearClientState = async (page: Page) => {
  await page.context().clearCookies();

  // Cleanup should never fail a test, especially when page is about:blank
  // or when the dev server is temporarily unavailable.
  try {
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  } catch {
    // ignore storage access errors in teardown
  }
};

export const registerNewUser = async (
  page: Page,
  email: string,
  tag: string,
  password: string,
  specialty: string = 'ARCHITECT',
) => {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Tag (pseudo unique)').fill(tag);
  await page.getByLabel('Spécialité').click();
  await page.getByRole('option', { name: specialty }).click();
  await page.getByLabel('Mot de passe').first().fill(password);
  await page.getByLabel('Confirmer le mot de passe').fill(password);

  await page.getByRole('button', { name: /Choisir un avatar|Changer l'avatar/ }).click();
  await page.getByRole('img', { name: 'Avatar 1' }).click();

  await page.getByRole('button', { name: 'Rejoindre' }).click();
};

// User creation helpers
export const createRegisteredUser = async (
  request: APIRequestContext,
  specialty: string = 'TACTICIAN',
) => {
  const uniqueId = faker.string.alphanumeric(10).toLowerCase();
  const user = {
    email: `e2e.${uniqueId}@example.com`,
    tag: `e2e_${uniqueId}`,
    password: 'E2e!Pass123',
  };

  const registerResponse = await request.post('/api/auths/register', {
    data: {
      email: user.email,
      tag: user.tag,
      password: user.password,
      specialty,
      profileImage: 'Avatar1.png',
    },
  });

  expect(registerResponse.status()).toBe(201);
  return user;
};

export const loginUser = async (
  page: Page,
  request: APIRequestContext,
) => {
  const user = await createRegisteredUser(request);
  await goToLoginPage(page);
  await loginWith(page, user.email, user.password);
  return user;
};
