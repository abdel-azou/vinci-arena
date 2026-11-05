import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CreateTournamentPage from './CreateTournamentPage';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';
import {
  createTournament,
  getMyDraftTournaments,
  publishTournament,
  updateTournament,
} from '../../services/tournamentService';

vi.mock('../../services/tournamentService', () => ({
  createTournament: vi.fn(),
  getMyDraftTournaments: vi.fn(),
  updateTournament: vi.fn(),
  publishTournament: vi.fn(),
}));

const buildMemberContext = (
  overrides?: Partial<MemberContextType>,
): MemberContextType => ({
  changePassword: vi.fn(),
  authenticatedMember: {
    email: 'admin@mail.com',
    tag: 'Admin',
    specialty: 'HEALER',
    token: 'fake-token',
    role: 'ADMIN',
    teamId: null,
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

describe('CreateTournamentPage', () => {
  const getStartDateInput = () =>
    screen.getByLabelText(/début du tournoi/i, { selector: 'input#startDate' });

  const getEndDateInput = () =>
    screen.getByLabelText(/fin du tournoi/i, { selector: 'input#endDate' });

  const getRegistrationDeadlineInput = () =>
    screen.getByLabelText(/date limite d'inscription/i, {
      selector: 'input#registrationDeadline',
    });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMyDraftTournaments).mockResolvedValue([]);
  });

  test('renders the tournament form for an admin', async () => {
    render(
      <MemoryRouter>
        <MemberContext.Provider value={buildMemberContext()}>
          <CreateTournamentPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    await screen.findByText(/brouillons admin/i);
    expect(screen.getByText(/créer un tournoi/i)).toBeTruthy();
    expect(screen.getByLabelText(/nom du tournoi/i)).toBeTruthy();
    expect(screen.getByLabelText(/description/i)).toBeTruthy();
    expect(screen.getByLabelText(/places/i)).toBeTruthy();
    expect(getStartDateInput()).toBeTruthy();
    expect(getRegistrationDeadlineInput()).toBeTruthy();
  });

  test('displays an error when the form is submitted empty', async () => {
    render(
      <MemoryRouter>
        <MemberContext.Provider value={buildMemberContext()}>
          <CreateTournamentPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /créer le tournoi/i,
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/tous les champs sont obligatoires/i),
      ).toBeTruthy();
    });
  });

  test('calls createTournament with form data when the form is valid', async () => {
    vi.mocked(createTournament).mockResolvedValueOnce({
      id: 1,
      name: 'Winter Clash',
      description: 'Tournoi test',
      startDate: '2026-04-10T18:00',
      endDate: '2026-04-12T20:00',
      registrationDeadline: '2026-04-08T23:59',
      maxTeams: 16,
      status: 'PREPARATION',
      administratorId: 99,
      registeredTeamsCount: 0,
      registeredTeamNames: [],
      participantTeams: [],
    });

    render(
      <MemoryRouter>
        <MemberContext.Provider value={buildMemberContext()}>
          <CreateTournamentPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/nom du tournoi/i), {
      target: { value: 'Winter Clash' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Tournoi test' },
    });
    fireEvent.change(screen.getByLabelText(/places/i), {
      target: { value: '16' },
    });
    fireEvent.change(getStartDateInput(), {
      target: { value: '2030-04-10' },
    });
    fireEvent.change(getEndDateInput(), {
      target: { value: '2030-04-12' },
    });
    fireEvent.change(getRegistrationDeadlineInput(), {
      target: { value: '2030-04-08' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /créer le tournoi/i,
      }),
    );

    await waitFor(() => {
      expect(createTournament).toHaveBeenCalledWith({
        name: 'Winter Clash',
        description: 'Tournoi test',
        startDate: '2030-04-10T00:00',
        endDate: '2030-04-12T00:00',
        registrationDeadline: '2030-04-08T00:00',
        maxTeams: 16,
      });
    });
  });

  test('updates a selected draft when the admin edits it', async () => {
    vi.mocked(getMyDraftTournaments).mockResolvedValueOnce([
      {
        id: 7,
        name: 'Draft Cup',
        description: 'Brouillon initial',
        startDate: '2026-04-10T18:00',
        endDate: '2026-04-12T20:00',
        registrationDeadline: '2026-04-08T23:59',
        maxTeams: 16,
        status: 'PREPARATION',
        administratorId: 99,
        registeredTeamsCount: 0,
        registeredTeamNames: [],
        participantTeams: [],
      },
    ]);
    vi.mocked(updateTournament).mockResolvedValueOnce({
      id: 7,
      name: 'Draft Cup Updated',
      description: 'Description modifiée',
      startDate: '2026-05-10T18:00',
      endDate: '2026-05-12T20:00',
      registrationDeadline: '2026-05-08T23:59',
      maxTeams: 24,
      status: 'PREPARATION',
      administratorId: 99,
      registeredTeamsCount: 0,
      registeredTeamNames: [],
      participantTeams: [],
    });

    render(
      <MemoryRouter>
        <MemberContext.Provider value={buildMemberContext()}>
          <CreateTournamentPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    await screen.findByRole('button', { name: /draft cup/i });

    fireEvent.click(screen.getByRole('button', { name: /modifier/i }));
    fireEvent.change(screen.getByLabelText(/nom du tournoi/i), {
      target: { value: 'Draft Cup Updated' },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Description modifiée' },
    });
    fireEvent.change(screen.getByLabelText(/places/i), {
      target: { value: '24' },
    });
    fireEvent.change(getStartDateInput(), {
      target: { value: '2026-05-10' },
    });
    fireEvent.change(getEndDateInput(), {
      target: { value: '2026-05-12' },
    });
    fireEvent.change(getRegistrationDeadlineInput(), {
      target: { value: '2026-05-08' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /mettre à jour le brouillon/i,
      }),
    );

    await waitFor(() => {
      expect(updateTournament).toHaveBeenCalledWith(7, {
        name: 'Draft Cup Updated',
        description: 'Description modifiée',
        startDate: '2026-05-10T00:00',
        endDate: '2026-05-12T00:00',
        registrationDeadline: '2026-05-08T00:00',
        maxTeams: 24,
      });
    });
  });

  test('publishes the selected draft', async () => {
    vi.mocked(getMyDraftTournaments).mockResolvedValueOnce([
      {
        id: 9,
        name: 'Draft Cup',
        description: 'Brouillon initial',
        startDate: '2026-04-10T18:00',
        endDate: '2026-04-12T20:00',
        registrationDeadline: '2026-04-08T23:59',
        maxTeams: 16,
        status: 'PREPARATION',
        administratorId: 99,
        registeredTeamsCount: 0,
        registeredTeamNames: [],
        participantTeams: [],
      },
    ]);
    vi.mocked(publishTournament).mockResolvedValueOnce({
      id: 9,
      name: 'Draft Cup',
      description: 'Brouillon initial',
      startDate: '2026-04-10T18:00',
      endDate: '2026-04-12T20:00',
      registrationDeadline: '2026-04-08T23:59',
      maxTeams: 16,
      status: 'INSCRIPTION',
      administratorId: 99,
      registeredTeamsCount: 0,
      registeredTeamNames: [],
      participantTeams: [],
    });

    render(
      <MemoryRouter>
        <MemberContext.Provider value={buildMemberContext()}>
          <CreateTournamentPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    await screen.findByRole('button', { name: /draft cup/i });

    fireEvent.click(screen.getByRole('button', { name: /publier/i }));

    await waitFor(() => {
      expect(publishTournament).toHaveBeenCalledWith(9);
      expect(screen.getByText(/tournoi publié avec succès/i)).toBeTruthy();
    });
  });
});
