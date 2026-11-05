import { AuthenticatedMember, MemberRole } from '../types';
import {
  isAuthenticatedMemberRemembered,
  storeAuthenticatedMember,
} from '../utils/session';

const SESSION_EXPIRED_MESSAGE = 'Session expirée, reconnecte-toi';

const persistAuthenticatedMember = (member: AuthenticatedMember) => {
  storeAuthenticatedMember(member, isAuthenticatedMemberRemembered());
};

const buildMemberWithRole = (
  authenticatedMember: AuthenticatedMember,
  newRole: MemberRole,
): AuthenticatedMember => {
  const nextIsResponsible =
    newRole === 'RESPONSIBLE' ||
    (newRole === 'ADMIN' &&
      (authenticatedMember.isResponsible ||
        authenticatedMember.role === 'RESPONSIBLE'));

  return {
    ...authenticatedMember,
    role: newRole,
    isResponsible: nextIsResponsible,
  };
};

const buildMemberWithTeamId = (
  authenticatedMember: AuthenticatedMember,
  teamId: number | null,
): AuthenticatedMember => ({
  ...authenticatedMember,
  teamId,
  isResponsible: teamId === null ? false : authenticatedMember.isResponsible,
});

const withSessionGuard = async <T>(
  action: () => Promise<T>,
  onSessionExpired: () => void,
): Promise<T> => {
  try {
    return await action();
  } catch (error) {
    if (error instanceof Error && error.message === SESSION_EXPIRED_MESSAGE) {
      onSessionExpired();
    }
    throw error;
  }
};

export {
  buildMemberWithRole,
  buildMemberWithTeamId,
  persistAuthenticatedMember,
  withSessionGuard,
};
