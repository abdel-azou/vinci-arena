import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TournamentDetailPage from './TournamentDetailPage';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';
import {
  generateTournamentMatches,
  getTournamentById,
  getTournamentMatches,
  publishTournamentPlanning,
  registerMyTeamToTournament,
  respondToMatchResult,
  updateMatchSelection,
  updateMatchResult,
  updateTournamentMatch,
} from '../../services/tournamentService';

vi.mock('../../services/tournamentService', () => ({
  getTournamentById: vi.fn(),
  getTournamentMatches: vi.fn(),
  registerMyTeamToTournament: vi.fn(),
  updateTournamentMatch: vi.fn(),
  updateMatchSelection: vi.fn(),
  updateMatchResult: vi.fn(),
  respondToMatchResult: vi.fn(),
  generateTournamentMatches: vi.fn(),
  publishTournamentPlanning: vi.fn(),
}));

const buildMemberContext = (
  overrides?: Partial<MemberContextType>,
): MemberContextType => ({
  changePassword: vi.fn(),
  authenticatedMember: {
    id: 1,
    email: 'captain@mail.com',
    tag: 'captain',
    specialty: 'TACTICIAN',
    token: 'fake-token',
    role: 'RESPONSIBLE',
    teamId: 10,
  },
  registerMember: vi.fn(),
  loginMember: vi.fn(),
  clearMember: vi.fn(),
  updateMemberRole: vi.fn(),
  updateSpecialty: vi.fn(),
  updateProfileImage: vi.fn(),
  updateTeamId: vi.fn(),
  getMyUnavailabilities: vi.fn(),
  createUnavailability: vi.fn(),
  deleteUnavailability: vi.fn(),
  promoteMemberToAdmin: vi.fn(),
  removeMemberAdminRole: vi.fn(),
  getAdmins: vi.fn(),
  searchMembers: vi.fn(),
  ...overrides,
});

const buildMatch = (overrides?: Record<string, unknown>) => ({
  id: 1,
  tournamentId: 42,
  teamAId: 1,
  teamAName: 'Alpha',
  teamBId: 2,
  teamBName: 'Beta',
  round: 'QUARTER_FINAL',
  scheduledDate: '2026-04-12T18:00:00',
  status: 'PLANNED',
  administratorId: 99,
  selectionForTeamA: [],
  selectionForTeamB: [],
  isBye: false,
  teamAScore: null,
  teamBScore: null,
  resultStatus: 'NOT_ENCODED',
  teamAResultResponse: 'PENDING',
  teamBResultResponse: 'PENDING',
  ...overrides,
});

const renderPage = (memberOverrides?: Partial<MemberContextType>) => {
  render(
    <MemoryRouter initialEntries={['/tournaments/42']}>
      <MemberContext.Provider value={buildMemberContext(memberOverrides)}>
        <Routes>
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
        </Routes>
      </MemberContext.Provider>
    </MemoryRouter>,
  );
};

describe('TournamentDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows the registration button for a responsible member', async () => {
    vi.mocked(getTournamentById).mockResolvedValueOnce({
      id: 42,
      name: 'Arena Cup',
      description: 'Tournoi test',
      startDate: '2030-04-10T18:00:00',
      endDate: '2030-04-12T20:00:00',
      registrationDeadline: '2030-04-09T23:59:00',
      maxTeams: 16,
      status: 'INSCRIPTION',
      administratorId: 99,
      registeredTeamsCount: 2,
      registeredTeamNames: ['Alpha', 'Beta'],
      participantTeams: [],
    });

    renderPage();

    expect(
      await screen.findByRole('button', { name: /inscrire ma team/i }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /equipes/i }));
    expect(await screen.findByText('2/16')).toBeTruthy();
  });

  test('calls registerMyTeamToTournament from the detail page', async () => {
    vi.mocked(getTournamentById)
      .mockResolvedValueOnce({
        id: 42,
        name: 'Arena Cup',
        description: 'Tournoi test',
        startDate: '2030-04-10T18:00:00',
        endDate: '2030-04-12T20:00:00',
        registrationDeadline: '2030-04-09T23:59:00',
        maxTeams: 16,
        status: 'INSCRIPTION',
        administratorId: 99,
        registeredTeamsCount: 2,
        registeredTeamNames: ['Alpha', 'Beta'],
        participantTeams: [],
      })
      .mockResolvedValueOnce({
        id: 42,
        name: 'Arena Cup',
        description: 'Tournoi test',
        startDate: '2030-04-10T18:00:00',
        endDate: '2030-04-12T20:00:00',
        registrationDeadline: '2030-04-09T23:59:00',
        maxTeams: 16,
        status: 'INSCRIPTION',
        administratorId: 99,
        registeredTeamsCount: 3,
        registeredTeamNames: ['Alpha', 'Beta', 'Gamma'],
        participantTeams: [],
      });

    vi.mocked(registerMyTeamToTournament).mockResolvedValueOnce({
      message: 'Equipe inscrite au tournoi',
      teamId: 10,
      tournamentId: 42,
    });

    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: /inscrire ma team/i }),
    );

    await waitFor(() => {
      expect(registerMyTeamToTournament).toHaveBeenCalledWith(42);
    });
    expect(await screen.findByText('Equipe inscrite au tournoi')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /equipes/i }));
    expect(await screen.findByText('3/16')).toBeTruthy();
  });

  test('shows planning generation button for an admin after the deadline', async () => {
    vi.mocked(getTournamentById).mockResolvedValueOnce({
      id: 42,
      name: 'Arena Cup',
      description: 'Tournoi test',
      startDate: '2026-04-12T18:00:00',
      endDate: '2026-04-15T20:00:00',
      registrationDeadline: '2026-04-09T23:59:00',
      maxTeams: 16,
      status: 'INSCRIPTION',
      administratorId: 99,
      registeredTeamsCount: 8,
      registeredTeamNames: ['Alpha', 'Beta'],
      participantTeams: [],
    });
    vi.mocked(getTournamentMatches).mockResolvedValueOnce([]);
    vi.mocked(generateTournamentMatches).mockResolvedValue([]);
    vi.mocked(publishTournamentPlanning).mockResolvedValue({
      message: 'Planning publie',
    });
    vi.mocked(updateTournamentMatch).mockResolvedValue(buildMatch());
    vi.mocked(updateMatchSelection).mockResolvedValue(
      buildMatch({ status: 'PUBLISHED' }),
    );
    vi.mocked(updateMatchResult).mockResolvedValue(
      buildMatch({ teamAScore: 1, teamBScore: 0 }),
    );
    vi.mocked(respondToMatchResult).mockResolvedValue(
      buildMatch({
        teamAScore: 1,
        teamBScore: 0,
        resultStatus: 'CONFIRMED',
        teamAResultResponse: 'CONFIRMED',
        teamBResultResponse: 'CONFIRMED',
      }),
    );

    renderPage({
      authenticatedMember: {
        id: 9,
        email: 'admin@mail.com',
        tag: 'admin',
        specialty: 'TACTICIAN',
        token: 'admin-token',
        role: 'ADMIN',
        teamId: 10,
      },
    });

    fireEvent.click(await screen.findByRole('button', { name: /planning/i }));

    expect(
      await screen.findByRole('button', { name: /generer le planning/i }),
    ).toBeTruthy();
  });

  test('shows a planning generation permission message for a non-admin after the deadline', async () => {
    vi.mocked(getTournamentById).mockResolvedValueOnce({
      id: 42,
      name: 'Arena Cup',
      description: 'Tournoi test',
      startDate: '2026-04-12T18:00:00',
      endDate: '2026-04-15T20:00:00',
      registrationDeadline: '2026-04-09T23:59:00',
      maxTeams: 16,
      status: 'INSCRIPTION',
      administratorId: 99,
      registeredTeamsCount: 8,
      registeredTeamNames: ['Alpha', 'Beta'],
      participantTeams: [],
    });
    vi.mocked(getTournamentMatches).mockResolvedValueOnce([]);

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /planning/i }));

    expect(
      await screen.findByText(
        /seul un admin peut generer le planning de ce tournoi/i,
      ),
    ).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: /generer le planning/i }),
    ).toBeNull();
  });

  test('does not show edit fields until modifier planning is clicked', async () => {
    vi.mocked(getTournamentById).mockResolvedValueOnce({
      id: 42,
      name: 'Arena Cup',
      description: 'Tournoi test',
      startDate: '2026-04-12T18:00:00',
      endDate: '2026-04-15T20:00:00',
      registrationDeadline: '2026-04-09T23:59:00',
      maxTeams: 16,
      status: 'INSCRIPTION',
      administratorId: 99,
      registeredTeamsCount: 8,
      registeredTeamNames: ['Alpha', 'Beta'],
      participantTeams: [
        { teamId: 1, teamName: 'Alpha', memberTags: [] },
        { teamId: 2, teamName: 'Beta', memberTags: [] },
      ],
    });
    vi.mocked(getTournamentMatches).mockResolvedValueOnce([buildMatch()]);
    vi.mocked(updateTournamentMatch).mockResolvedValue(buildMatch());

    renderPage({
      authenticatedMember: {
        id: 9,
        email: 'admin@mail.com',
        tag: 'admin',
        specialty: 'TACTICIAN',
        token: 'admin-token',
        role: 'ADMIN',
        teamId: 10,
      },
    });

    fireEvent.click(await screen.findByRole('button', { name: /planning/i }));

    expect(screen.queryByLabelText(/equipe a/i)).toBeNull();

    fireEvent.click(await screen.findByText(/match #1/i));
    fireEvent.click(
      await screen.findByRole('button', { name: /modifier le planning/i }),
    );

    expect(
      await screen.findByText(/modifier le match selectionne/i),
    ).toBeTruthy();
    expect(await screen.findByLabelText(/equipe a/i)).toBeTruthy();
  });

  test('shows a simulated score for past matches without encoded result', async () => {
    vi.mocked(getTournamentById).mockResolvedValueOnce({
      id: 42,
      name: 'Arena Cup',
      description: 'Tournoi test',
      startDate: '2026-04-10T18:00:00',
      endDate: '2026-04-30T20:00:00',
      registrationDeadline: '2026-04-09T23:59:00',
      maxTeams: 16,
      status: 'EN_COURS',
      administratorId: 99,
      registeredTeamsCount: 8,
      registeredTeamNames: ['Alpha', 'Beta'],
      participantTeams: [],
    });
    vi.mocked(getTournamentMatches).mockResolvedValueOnce([
      buildMatch({
        status: 'PUBLISHED',
        scheduledDate: '2020-04-10T18:00:00',
      }),
    ]);

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /planning/i }));

    expect(await screen.findByText('Score simule')).toBeTruthy();
    expect(await screen.findByText('Alpha 1 - 2 Beta')).toBeTruthy();
  });
});
