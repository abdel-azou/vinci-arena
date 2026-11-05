import { TournamentResponse } from '../../services/tournamentService';

export type DetailSection = 'overview' | 'participants' | 'planning';
type TournamentStatus = TournamentResponse['status'];

export const formatTournamentDate = (value: string) =>
  new Date(value).toLocaleString('fr-BE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export const isRegistrationOpen = (tournament: TournamentResponse) =>
  tournament.status === 'INSCRIPTION' &&
  new Date(tournament.registrationDeadline) >= new Date();

export const hasRegistrationDeadlinePassed = (tournament: TournamentResponse) =>
  new Date(tournament.registrationDeadline) < new Date();

export const getRegistrationStatusMessage = (
  tournament: TournamentResponse,
) => {
  if (tournament.registeredTeamsCount >= tournament.maxTeams) {
    return 'Le tournoi est complet.';
  }
  if (tournament.status === 'PREPARATION') {
    return "Le tournoi n'est pas encore publié.";
  }
  if (
    new Date(tournament.registrationDeadline) < new Date() ||
    tournament.status === 'EN_COURS' ||
    tournament.status === 'TERMINE'
  ) {
    return 'Les inscriptions sont closes pour ce tournoi.';
  }
  return null;
};

export const getTournamentStatusLabel = (status: TournamentStatus) => {
  if (status === 'PREPARATION') {
    return 'Brouillon';
  }
  if (status === 'INSCRIPTION') {
    return 'Inscription';
  }
  if (status === 'EN_COURS') {
    return 'En cours';
  }
  return 'Termine';
};

export const getTournamentStatusChipSx = (status: TournamentStatus) => {
  if (status === 'INSCRIPTION') {
    return {
      bgcolor: 'rgba(200, 170, 110, 0.18)',
      color: '#fff6de',
      borderColor: 'rgba(200, 170, 110, 0.4)',
    };
  }

  if (status === 'EN_COURS') {
    return {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
      color: '#f8fafc',
      borderColor: 'rgba(255, 255, 255, 0.16)',
    };
  }

  if (status === 'PREPARATION') {
    return {
      bgcolor: 'rgba(255, 255, 255, 0.06)',
      color: '#d9d3c0',
      borderColor: 'rgba(255, 255, 255, 0.12)',
    };
  }

  return {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
    color: '#f0e6d2',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  };
};

export const heroCardSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 4,
  borderColor: 'rgba(200, 170, 110, 0.24)',
  background:
    'linear-gradient(145deg, rgba(14, 22, 36, 0.98) 0%, rgba(9, 15, 27, 0.98) 100%)',
  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.24)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at top right, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 38%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '0 auto 0 0',
    width: 4,
    background:
      'linear-gradient(180deg, rgba(200, 170, 110, 0.25) 0%, #c8aa6e 35%, rgba(255, 255, 255, 0.22) 100%)',
    pointerEvents: 'none',
  },
};

export const actionCardSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 4,
  borderColor: 'rgba(200, 170, 110, 0.24)',
  background:
    'linear-gradient(145deg, rgba(14, 22, 36, 0.98) 0%, rgba(9, 15, 27, 0.98) 100%)',
  boxShadow: '0 18px 34px rgba(0, 0, 0, 0.18)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 38%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '0 auto 0 0',
    width: 4,
    background:
      'linear-gradient(180deg, rgba(200, 170, 110, 0.25) 0%, #c8aa6e 35%, rgba(255, 255, 255, 0.22) 100%)',
    pointerEvents: 'none',
  },
};

export const rosterCardSx = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 4,
  borderColor: 'rgba(200, 170, 110, 0.2)',
  background:
    'linear-gradient(145deg, rgba(14, 22, 36, 0.98) 0%, rgba(9, 15, 27, 0.98) 100%)',
  boxShadow: '0 18px 34px rgba(0, 0, 0, 0.18)',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at top right, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 38%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '0 auto 0 0',
    width: 4,
    background:
      'linear-gradient(180deg, rgba(200, 170, 110, 0.25) 0%, #c8aa6e 35%, rgba(255, 255, 255, 0.22) 100%)',
    pointerEvents: 'none',
  },
};

export const metricPaperSx = {
  p: 2.25,
  height: '100%',
  borderRadius: 3,
  borderColor: 'rgba(255, 255, 255, 0.08)',
  background:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
  backdropFilter: 'blur(10px)',
};

export const teamPaperSx = {
  p: 2,
  height: '100%',
  borderRadius: 3,
  borderColor: 'rgba(255, 255, 255, 0.09)',
  background:
    'linear-gradient(180deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.025) 100%)',
};
