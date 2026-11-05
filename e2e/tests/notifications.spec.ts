import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import {
  clearClientState,
  createRegisteredUser,
  createTeamFromNavbar,
  loginAs,
  logout,
  sendJoinRequestToTeam,
} from './helper';

test.describe('Notifications', () => {
  test.afterEach(async ({ page }) => {
    await clearClientState(page);
  });

  test('TC-NOTIF-1: responsible should receive a notification after join request', async ({
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

    const notificationBell = page
      .locator('button')
      .filter({ has: page.locator('svg[data-testid="NotificationsIcon"]') })
      .first();

    await expect(notificationBell).toBeVisible({ timeout: 5000 });
    await expect(notificationBell).toBeEnabled({ timeout: 5000 });
    await notificationBell.click();

    await expect(page.getByText('Notifications')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByText('Aucune notification')).not.toBeVisible({
      timeout: 5000,
    });
  });
});
