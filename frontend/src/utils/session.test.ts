import { describe, expect, test, beforeEach } from 'vitest';
import {
  clearAuthenticatedMember,
  getAuthenticatedMember,
  isAuthenticatedMemberRemembered,
  storeAuthenticatedMember,
} from './session';
import { AuthenticatedMember } from '../types';

const buildMember = (): AuthenticatedMember => ({
  email: 'member@mail.com',
  tag: 'member',
  specialty: 'TACTICIAN',
  token: 'token-123',
  role: 'MEMBER',
  teamId: null,
});

describe('session storage helpers', () => {
  beforeEach(() => {
    clearAuthenticatedMember();
  });

  test('stores remembered member only in localStorage', () => {
    storeAuthenticatedMember(buildMember(), true);

    expect(localStorage.getItem('authenticatedMember')).not.toBeNull();
    expect(sessionStorage.getItem('authenticatedMember')).toBeNull();
    expect(isAuthenticatedMemberRemembered()).toBe(true);
    expect(getAuthenticatedMember()?.email).toBe('member@mail.com');
  });

  test('replaces remembered session when storing in sessionStorage', () => {
    storeAuthenticatedMember(buildMember(), true);
    const updatedMember = { ...buildMember(), email: 'other@mail.com' };

    storeAuthenticatedMember(updatedMember, false);

    expect(localStorage.getItem('authenticatedMember')).toBeNull();
    expect(sessionStorage.getItem('authenticatedMember')).not.toBeNull();
    expect(isAuthenticatedMemberRemembered()).toBe(false);
    expect(getAuthenticatedMember()?.email).toBe('other@mail.com');
  });
});
