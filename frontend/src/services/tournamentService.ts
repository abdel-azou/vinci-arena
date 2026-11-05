import { getAuthenticatedMember } from '../utils/session';

type CreateTournamentPayload = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
};

type TournamentResponse = {
  id: number;
  name: string;
  description: string;
  winnerTeamName?: string | null;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  status: string;
  administratorId: number;
  registeredTeamsCount: number;
  registeredTeamNames: string[];
  participantTeams: ParticipantTeamResponse[];
};

type ParticipantTeamResponse = {
  teamId: number;
  teamName: string;
  memberTags: string[];
};

type RegisterTeamToTournamentResponse = {
  message: string;
  teamId: number;
  tournamentId: number;
};

type TournamentMatchResponse = {
  id: number;
  tournamentId: number;
  teamAId: number;
  teamAName: string;
  teamBId: number | null;
  teamBName: string | null;
  round: string;
  scheduledDate: string | null;
  status: string;
  administratorId: number;
  selectionForTeamA: SelectedPlayerResponse[];
  selectionForTeamB: SelectedPlayerResponse[];
  isBye: boolean;
  teamAScore: number | null;
  teamBScore: number | null;
  resultStatus: string;
  teamAResultResponse: string;
  teamBResultResponse: string;
};

type SelectedPlayerResponse = {
  id: number;
  tag: string;
  specialty: string;
  role: string;
};

type UpdateTournamentMatchPayload = {
  teamAId: number;
  teamBId: number | null;
  scheduledDate: string;
};

type UpdateMatchSelectionPayload = {
  playerIds: number[];
};

type UpdateMatchResultPayload = {
  teamAScore: number;
  teamBScore: number;
};

type RespondToMatchResultPayload = {
  action: 'CONFIRM' | 'CORRECT' | 'REFUSE';
  teamAScore?: number;
  teamBScore?: number;
};

type PublishPlanningResponse = {
  message: string;
};

export const getTournaments = async (): Promise<TournamentResponse[]> => {
  const response = await fetch('/api/tournaments');

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? body.detail ?? body.error ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors du chargement des tournois'),
    );
  }

  return response.json();
};

export const getMyDraftTournaments = async (): Promise<
  TournamentResponse[]
> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch('/api/tournaments/my-drafts', {
    headers: {
      Authorization: member.token,
    },
  });

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? body.detail ?? body.error ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut voir les brouillons'),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Membre introuvable'));
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors du chargement des brouillons'),
    );
  }

  return response.json();
};

export const getTournamentById = async (
  id: number,
): Promise<TournamentResponse> => {
  const response = await fetch(`/api/tournaments/${id}`);

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (!response.ok) {
    throw new Error(await readErrorMessage('Tournoi introuvable'));
  }

  return response.json();
};

export const createTournament = async (
  payload: CreateTournamentPayload,
): Promise<TournamentResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch('/api/tournaments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: member.token,
    },
    body: JSON.stringify(payload),
  });

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut créer un tournoi'),
    );
  }

  if (response.status === 400) {
    throw new Error(
      await readErrorMessage('Les données du tournoi sont invalides'),
    );
  }

  if (response.status === 409) {
    throw new Error(
      await readErrorMessage(
        'Un tournoi avec ce nom existe déjà. Choisis un autre nom.',
      ),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors de la création du tournoi'),
    );
  }

  return response.json();
};

export const updateTournament = async (
  tournamentId: number,
  payload: CreateTournamentPayload,
): Promise<TournamentResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(`/api/tournaments/${tournamentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: member.token,
    },
    body: JSON.stringify(payload),
  });

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? body.detail ?? body.error ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut modifier les brouillons'),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Brouillon introuvable'));
  }

  if (response.status === 400) {
    throw new Error(
      await readErrorMessage('Impossible de modifier ce brouillon'),
    );
  }

  if (response.status === 409) {
    throw new Error(
      await readErrorMessage(
        'Un tournoi avec ce nom existe déjà. Choisis un autre nom.',
      ),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors de la modification du brouillon'),
    );
  }

  return response.json();
};

export const publishTournament = async (
  tournamentId: number,
): Promise<TournamentResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(`/api/tournaments/${tournamentId}/publish`, {
    method: 'POST',
    headers: {
      Authorization: member.token,
    },
  });

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut publier les brouillons'),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Brouillon introuvable'));
  }

  if (response.status === 400) {
    throw new Error(await readErrorMessage('Impossible de publier ce tournoi'));
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors de la publication du tournoi'),
    );
  }

  return response.json();
};

export const registerMyTeamToTournament = async (
  tournamentId: number,
): Promise<RegisterTeamToTournamentResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(`/api/tournaments/${tournamentId}/teams/me`, {
    method: 'POST',
    headers: {
      Authorization: member.token,
    },
  });

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage(
        "Seuls les responsables de l'équipe peuvent l'inscrire",
      ),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Tournoi introuvable'));
  }

  if (response.status === 400) {
    throw new Error(
      await readErrorMessage("Impossible d'inscrire la team à ce tournoi"),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage("Erreur lors de l'inscription au tournoi"),
    );
  }

  return response.json();
};

export const generateTournamentMatches = async (
  tournamentId: number,
): Promise<TournamentMatchResponse[]> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(
    `/api/tournaments/${tournamentId}/matches/generate`,
    {
      method: 'POST',
      headers: {
        Authorization: member.token,
      },
    },
  );

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut générer le planning'),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Tournoi introuvable'));
  }

  if (response.status === 400) {
    throw new Error(
      await readErrorMessage('Impossible de générer le planning'),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors de la génération du planning'),
    );
  }

  return response.json();
};

export const getTournamentMatches = async (
  tournamentId: number,
): Promise<TournamentMatchResponse[]> => {
  const member = getAuthenticatedMember();

  const response = await fetch(`/api/tournaments/${tournamentId}/matches`, {
    headers: member?.token
      ? {
          Authorization: member.token,
        }
      : undefined,
  });

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Tournoi introuvable'));
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors du chargement du planning'),
    );
  }

  return response.json();
};

export const updateTournamentMatch = async (
  tournamentId: number,
  matchId: number,
  payload: UpdateTournamentMatchPayload,
): Promise<TournamentMatchResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(
    `/api/tournaments/${tournamentId}/matches/${matchId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: member.token,
      },
      body: JSON.stringify(payload),
    },
  );

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut modifier un match'),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Match introuvable'));
  }

  if (response.status === 400) {
    throw new Error(await readErrorMessage('Impossible de modifier le match'));
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage('Erreur lors de la modification'));
  }

  return response.json();
};

export const updateMatchSelection = async (
  tournamentId: number,
  matchId: number,
  payload: UpdateMatchSelectionPayload,
): Promise<TournamentMatchResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(
    `/api/tournaments/${tournamentId}/matches/${matchId}/selection`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: member.token,
      },
      body: JSON.stringify(payload),
    },
  );

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage(
        "Seul un responsable de l'équipe peut faire la sélection",
      ),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Match introuvable'));
  }

  if (response.status === 400) {
    throw new Error(
      await readErrorMessage('Impossible de sauvegarder la sélection'),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors de la sauvegarde de la sélection'),
    );
  }

  return response.json();
};

export const updateMatchResult = async (
  tournamentId: number,
  matchId: number,
  payload: UpdateMatchResultPayload,
): Promise<TournamentMatchResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirÃ©e, reconnecte-toi');
  }

  const response = await fetch(
    `/api/tournaments/${tournamentId}/matches/${matchId}/result`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: member.token,
      },
      body: JSON.stringify(payload),
    },
  );

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 404) {
    throw new Error(
      await readErrorMessage(
        "Endpoint de resultat introuvable ou match introuvable. Redemarre l'API.",
      ),
    );
  }

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut encoder le resultat'),
    );
  }

  if (response.status === 400) {
    throw new Error(await readErrorMessage("Impossible d'encoder le resultat"));
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage("Erreur lors de l'encodage du resultat"),
    );
  }

  return response.json();
};

export const respondToMatchResult = async (
  tournamentId: number,
  matchId: number,
  payload: RespondToMatchResultPayload,
): Promise<TournamentMatchResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirÃ©e, reconnecte-toi');
  }

  const response = await fetch(
    `/api/tournaments/${tournamentId}/matches/${matchId}/result-response`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: member.token,
      },
      body: JSON.stringify(payload),
    },
  );

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage(
        "Seul un responsable d'une equipe du match peut repondre au resultat",
      ),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Match introuvable'));
  }

  if (response.status === 400) {
    throw new Error(
      await readErrorMessage('Impossible de repondre au resultat'),
    );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors de la reponse au resultat'),
    );
  }

  return response.json();
};

export const declareMatchForfeit = async (
  tournamentId: number,
  matchId: number,
): Promise<TournamentMatchResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(
    `/api/tournaments/${tournamentId}/matches/${matchId}/forfeit`,
    {
      method: 'POST',
      headers: {
        Authorization: member.token,
      },
    },
  );

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage(
        "Seul un responsable d'une equipe du match peut declarer forfait",
      ),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Match introuvable'));
  }

  if (response.status === 400) {
    throw new Error(await readErrorMessage('Impossible de declarer forfait'));
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage('Erreur lors de la declaration du forfait'),
    );
  }

  return response.json();
};

export const publishTournamentPlanning = async (
  tournamentId: number,
): Promise<PublishPlanningResponse> => {
  const member = getAuthenticatedMember();

  if (!member?.token) {
    throw new Error('Session expirée, reconnecte-toi');
  }

  const response = await fetch(
    `/api/tournaments/${tournamentId}/matches/publish`,
    {
      method: 'POST',
      headers: {
        Authorization: member.token,
      },
    },
  );

  const readErrorMessage = async (fallbackMessage: string) => {
    try {
      const body = await response.json();
      return body.message ?? fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage('Seul un admin peut publier le planning'),
    );
  }

  if (response.status === 404) {
    throw new Error(await readErrorMessage('Aucun match à publier'));
  }

  if (response.status === 400) {
    throw new Error(
      await readErrorMessage('Impossible de publier le planning'),
    );
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage('Erreur lors de la publication'));
  }

  return response.json();
};

export type {
  CreateTournamentPayload,
  ParticipantTeamResponse,
  TournamentResponse,
  RegisterTeamToTournamentResponse,
  TournamentMatchResponse,
  SelectedPlayerResponse,
  UpdateTournamentMatchPayload,
  UpdateMatchSelectionPayload,
  UpdateMatchResultPayload,
  RespondToMatchResultPayload,
  PublishPlanningResponse,
};
