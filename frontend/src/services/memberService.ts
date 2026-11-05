import {
  AdminRoleUpdateResponse,
  AdminSummary,
  AuthenticatedMember,
  ChangePasswordRequest,
  MemberUnavailability,
  PublicMemberProfile,
  UpdateProfileImageRequest,
  UpdateSpecialtyRequest,
} from '../types';
import { getAuthenticatedMember, getToken } from '../utils/session';

import { TournamentMatchResponse } from './tournamentService';

const readBackendMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const body = await response.json();
    return body.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const requireToken = (): string => {
  const token = getToken();
  if (!token) {
    throw new Error('Session expirée, reconnecte-toi');
  }
  return token;
};

const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  const response = await fetch('/api/members/me/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: requireToken(),
    },
    body: JSON.stringify(request),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 400) {
    throw new Error(await readBackendMessage(response, 'Données invalides'));
  }

  if (!response.ok) {
    throw new Error('Erreur lors du changement de mot de passe');
  }
};

const updateSpecialty = async (
  request: UpdateSpecialtyRequest,
): Promise<AuthenticatedMember> => {
  const response = await fetch('/api/members/me/specialty', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: requireToken(),
    },
    body: JSON.stringify(request),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 400) {
    throw new Error(await readBackendMessage(response, 'Données invalides'));
  }

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour de la spécialité');
  }

  return response.json();
};

const updateProfileImage = async (
  request: UpdateProfileImageRequest,
): Promise<AuthenticatedMember> => {
  const response = await fetch('/api/members/me/profile-image', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: requireToken(),
    },
    body: JSON.stringify(request),
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 400) {
    throw new Error(await readBackendMessage(response, 'Données invalides'));
  }

  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour de l'image de profil");
  }

  return response.json();
};

const getMyUnavailabilities = async (): Promise<MemberUnavailability[]> => {
  const response = await fetch('/api/members/me/unavailabilities', {
    headers: {
      Authorization: requireToken(),
    },
  });

  if (!response.ok) {
    throw new Error('Impossible de récupérer les indisponibilités');
  }

  return response.json();
};

const createUnavailability = async (
  startDate: string,
  endDate: string,
): Promise<MemberUnavailability> => {
  const response = await fetch('/api/members/me/unavailabilities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: requireToken(),
    },
    body: JSON.stringify({ startDate, endDate }),
  });

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(response, "Erreur lors de l'ajout"),
    );
  }

  return response.json();
};

const deleteUnavailability = async (id: number): Promise<void> => {
  const response = await fetch(`/api/members/me/unavailabilities/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: requireToken(),
    },
  });

  if (!response.ok) {
    throw new Error('Impossible de supprimer');
  }
};

const promoteMemberToAdmin = async (
  targetEmail: string,
): Promise<AdminRoleUpdateResponse> => {
  const response = await fetch('/api/members/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: requireToken(),
    },
    body: JSON.stringify({ email: targetEmail }),
  });

  if (response.status === 401) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 403) {
    throw new Error('Action réservée aux admins');
  }

  if (response.status === 404) {
    throw new Error(await readBackendMessage(response, 'Membre non trouvé'));
  }

  if (response.status === 409 || response.status === 400) {
    throw new Error(await readBackendMessage(response, 'Action impossible'));
  }

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(response, 'Erreur lors de la promotion admin'),
    );
  }

  return response.json();
};

const removeMemberAdminRole = async (
  targetEmail: string,
): Promise<AdminRoleUpdateResponse> => {
  const response = await fetch('/api/members/admin', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: requireToken(),
    },
    body: JSON.stringify({ email: targetEmail }),
  });

  if (response.status === 401) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 403) {
    throw new Error('Action réservée aux admins');
  }

  if (response.status === 404) {
    throw new Error(await readBackendMessage(response, 'Membre non trouvé'));
  }

  if (response.status === 409 || response.status === 400) {
    throw new Error(await readBackendMessage(response, 'Action impossible'));
  }

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(response, 'Erreur lors du retrait admin'),
    );
  }

  return response.json();
};

const getAdmins = async (): Promise<AdminSummary[]> => {
  const response = await fetch('/api/members/admin', {
    headers: {
      Authorization: requireToken(),
    },
  });

  if (response.status === 401) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 403) {
    throw new Error('Action réservée aux admins');
  }

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des admins');
  }

  return response.json();
};

const searchMembers = async (query: string): Promise<AdminSummary[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  const response = await fetch(
    `/api/members/search?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: requireToken(),
      },
    },
  );

  if (response.status === 401) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 403) {
    throw new Error('Action réservée aux admins');
  }

  if (!response.ok) {
    throw new Error('Erreur lors de la recherche');
  }

  return response.json();
};

const getPublicMemberProfile = async (
  id: number,
  token?: string,
): Promise<PublicMemberProfile> => {
  const response = await fetch(`/api/members/${id}`, {
    headers: token ? { Authorization: token } : undefined,
  });

  if (response.status === 404) {
    throw new Error('Membre introuvable');
  }

  if (!response.ok) {
    throw new Error('Erreur lors du chargement du profil');
  }

  return response.json();
};

const banMember = async (id: number): Promise<void> => {
  const response = await fetch(`/api/members/${id}`, {
    method: 'DELETE',
    headers: { Authorization: requireToken() },
  });

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(response, 'Erreur lors du bannissement'),
    );
  }
};

const unbanMember = async (id: number): Promise<void> => {
  const response = await fetch(`/api/members/${id}/unban`, {
    method: 'PATCH',
    headers: { Authorization: requireToken() },
  });

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(response, 'Erreur lors du débannissement'),
    );
  }
};

const getCurrentAuthenticatedMember =
  async (): Promise<AuthenticatedMember | null> => {
    const member = getAuthenticatedMember();

    if (!member?.token) {
      return null;
    }

    const response = await fetch('/api/members/me', {
      method: 'GET',
      headers: {
        Authorization: member.token,
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };

const getAllMembers = async (): Promise<PublicMemberProfile[]> => {
  const response = await fetch('/api/members');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des membres');
  }
  return response.json();
};

const getMemberTournamentMatches = async (
  memberId: number,
  tournamentId: number,
): Promise<TournamentMatchResponse[]> => {
  const response = await fetch(
    `/api/members/${memberId}/tournaments/${tournamentId}/matches`,
    {
      headers: {
        Authorization: requireToken(),
      },
    },
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  if (response.status === 404) {
    throw new Error(
      await readBackendMessage(response, 'Tournoi ou membre non trouvé'),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(response, 'Impossible de récupérer les matchs'),
    );
  }

  return response.json();
};

export {
  banMember,
  changePassword,
  createUnavailability,
  deleteUnavailability,
  getAdmins,
  getAllMembers,
  getCurrentAuthenticatedMember,
  getMemberTournamentMatches,
  getMyUnavailabilities,
  getPublicMemberProfile,
  promoteMemberToAdmin,
  removeMemberAdminRole,
  searchMembers,
  unbanMember,
  updateProfileImage,
  updateSpecialty,
};
