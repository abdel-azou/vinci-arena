import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
  createRegisteredUser,
  createTeamFromNavbar,
  loginAs,
  logout,
  sendJoinRequestToTeam,
} from './helper';

test.describe('Join requests', () => {
  test('TC-JOIN-1: should send and display a join request in my team page', async ({
    page,
    request,
  }) => {
    const responsibleUser = await createRegisteredUser(request, 'ARCHITECT');
    const joinerUser = await createRegisteredUser(request, 'TACTICIAN');
    const teamName = `Team_${faker.string.alphanumeric(8).toUpperCase()}`;

    await loginAs(page, responsibleUser.email, responsibleUser.password);
    await createTeamFromNavbar(page, teamName);
    await logout(page);

    await loginAs(page, joinerUser.email, joinerUser.password);
    await sendJoinRequestToTeam(page, teamName);
    await logout(page);

    await loginAs(page, responsibleUser.email, responsibleUser.password);
    await page.getByRole('button', { name: 'Ma Team' }).click();
    await expect(page).toHaveURL(/\/team$/);

    await expect(page.getByText(/Demandes d'adhésion/)).toBeVisible();
    await expect(page.getByText(joinerUser.tag)).toBeVisible();
  });
});
