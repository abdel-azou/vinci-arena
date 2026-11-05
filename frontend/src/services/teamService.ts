import {
  AuthenticatedMember,
  Team,
  CreateTeamRequest,
  TeamSummary,
  Memberdto,
  JoinRequest,
} from '../types';
import { refreshAuthenticatedMember } from './authService';
import { getToken } from '../utils/session';

const readBackendMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const body = await response.json();
    return body.message ?? body.detail ?? body.error ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

// Creates a new team and returns the created Team object
const createTeam = async (
  nom: string,
  secondResponsibleId?: number,
): Promise<Team> => {
  const token = getToken();

  if (!token) {
    throw new Error('Non authentifié');
  }

  const request: CreateTeamRequest = {
    nom,
    ...(secondResponsibleId !== undefined && { secondResponsibleId }),
  };

  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(request),
  });

  if (response.status === 201) {
    const createdTeam: Team = await response.json();
    return createdTeam;
  }

  if (response.status === 400) {
    throw new Error('Données invalides');
  }

  if (response.status === 401) {
    throw new Error('Non autorisé');
  }

  if (response.status === 409) {
    throw new Error(
      await readBackendMessage(response, "Impossible de créer l'équipe"),
    );
  }

  throw new Error("Erreur lors de la création de l'équipe");
};

// Get all teams
const getTeams = async (token?: string): Promise<TeamSummary[]> => {
  const response = await fetch('/api/teams', {
    headers: token ? { Authorization: token } : undefined,
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des équipes');
  return response.json();
};

// Get team members
const getTeamMembers = async (
  teamId: number,
  token?: string,
): Promise<Memberdto[]> => {
  const response = await fetch(`/api/teams/${teamId}/members`, {
    headers: token ? { Authorization: token } : undefined,
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des membres');
  return response.json();
};

// Send join request to a team
const sendJoinRequest = async (
  teamId: number,
  token: string,
): Promise<void> => {
  const response = await fetch(`/api/teams/${teamId}/join-requests`, {
    method: 'POST',
    headers: { Authorization: token },
  });

  if (response.status === 409) {
    throw new Error(
      await readBackendMessage(response, 'Demande déjà en cours ou impossible'),
    );
  }

  if (
    response.status === 400 ||
    response.status === 403 ||
    response.status === 404
  ) {
    throw new Error(
      await readBackendMessage(response, "Erreur lors de l'envoi"),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(response, "Erreur lors de l'envoi"),
    );
  }
};

// Leave current team
const leaveTeam = async (token: string): Promise<AuthenticatedMember> => {
  const response = await fetch('/api/teams/members/me', {
    method: 'DELETE',
    headers: { Authorization: token },
  });
  if (!response.ok) {
    throw new Error(
      await readBackendMessage(
        response,
        "Erreur lors de la sortie de l'équipe",
      ),
    );
  }

  const contentLengthHeader = response.headers.get('content-length');
  const contentTypeHeader = response.headers.get('content-type') ?? '';
  const hasJsonBody =
    contentTypeHeader.includes('application/json') &&
    contentLengthHeader !== '0';

  if (hasJsonBody) {
    return response.json();
  }

  return refreshAuthenticatedMember(token);
};

// Get join requests for my team (responsible only)
const getMyJoinRequests = async (token: string): Promise<JoinRequest[]> => {
  const response = await fetch('/api/teams/my/join-requests', {
    headers: { Authorization: token },
  });
  if (response.status === 401) {
    throw new Error('Non autorisé');
  }
  if (response.status === 403) {
    const message = await readBackendMessage(
      response,
      'Erreur lors du chargement des demandes',
    );
    if (message.toLowerCase().includes('responsable')) {
      return [];
    }
    throw new Error(message);
  }
  if (!response.ok) {
    throw new Error(
      await readBackendMessage(
        response,
        'Erreur lors du chargement des demandes',
      ),
    );
  }
  return response.json();
};

// Accept or reject a join request
const manageJoinRequest = async (
  requestId: number,
  action: 'accept' | 'reject',
  token: string,
  reason?: string,
): Promise<void> => {
  const options: RequestInit = {
    method: 'PATCH',
    headers: {
      Authorization: token,
      ...(action === 'reject' && { 'Content-Type': 'application/json' }),
    },
    ...(action === 'reject' && { body: JSON.stringify({ reason }) }),
  };

  const response = await fetch(
    `/api/teams/join-requests/${requestId}/${action}`,
    options,
  );
  if (response.status === 401) {
    throw new Error('Non autorisé');
  }
  if (
    response.status === 403 ||
    response.status === 404 ||
    response.status === 409
  ) {
    throw new Error(
      await readBackendMessage(
        response,
        'Erreur lors du traitement de la demande',
      ),
    );
  }
  if (!response.ok) {
    throw new Error(
      await readBackendMessage(
        response,
        'Erreur lors du traitement de la demande',
      ),
    );
  }
};

// Assign or replace the second responsible of my team
const assignSecondResponsible = async (
  memberId: number,
  token: string,
): Promise<TeamSummary> => {
  const response = await fetch('/api/teams/my/second-responsible', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ memberId }),
  });

  if (
    response.status === 400 ||
    response.status === 403 ||
    response.status === 404
  ) {
    throw new Error(
      await readBackendMessage(
        response,
        'Impossible de nommer ce second responsable',
      ),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readBackendMessage(
        response,
        'Erreur lors de la mise à jour du second responsable',
      ),
    );
  }

  return response.json();
};

export {
  createTeam,
  getTeams,
  getTeamMembers,
  sendJoinRequest,
  leaveTeam,
  getMyJoinRequests,
  manageJoinRequest,
  assignSecondResponsible,
};
