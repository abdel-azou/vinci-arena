import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import HomePage from './HomePage';
import { getTournaments } from '../../services/tournamentService';

vi.mock('../../services/tournamentService', () => ({
  getTournaments: vi.fn(),
}));

const tournamentsFixture = [
  {
    id: 1,
    name: 'Arena Cup',
    description: 'Tournoi avec le joueur Lynx',
    startDate: '2026-04-10T18:00:00',
    endDate: '2026-04-12T20:00:00',
    registrationDeadline: '2026-04-09T23:59:00',
    maxTeams: 16,
    status: 'INSCRIPTION' as const,
    administratorId: 99,
    registeredTeamsCount: 2,
    registeredTeamNames: ['Alpha', 'Beta'],
    participantTeams: [
      {
        teamId: 10,
        teamName: 'TEAM_ALPHA',
        memberTags: ['Lynx', 'Pulse'],
      },
    ],
  },
  {
    id: 2,
    name: 'Summer Clash',
    description: 'Compétition estivale',
    startDate: '2026-07-10T18:00:00',
    endDate: '2026-07-12T20:00:00',
    registrationDeadline: '2026-07-09T23:59:00',
    maxTeams: 16,
    status: 'INSCRIPTION' as const,
    administratorId: 99,
    registeredTeamsCount: 2,
    registeredTeamNames: ['Gamma', 'Delta'],
    participantTeams: [
      {
        teamId: 20,
        teamName: 'TEAM_GAMMA',
        memberTags: ['Storm', 'Flash'],
      },
    ],
  },
];

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTournaments).mockResolvedValue(tournamentsFixture);
  });

  test('searches tournaments by title only', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await screen.findByText('Arena Cup');
    expect(screen.getByText('Summer Clash')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/rechercher un tournoi/i), {
      target: { value: 'Lynx' },
    });
    fireEvent.click(screen.getByRole('button', { name: /rechercher/i }));

    await waitFor(() => {
      expect(screen.queryByText('Arena Cup')).toBeNull();
    });
  });

  test('filters tournaments by player tag search', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    await screen.findByText('Arena Cup');

    fireEvent.click(screen.getByRole('button', { name: /filtres/i }));
    fireEvent.change(screen.getByLabelText(/rechercher un joueur par tag/i), {
      target: { value: 'Flash' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Arena Cup')).toBeNull();
      expect(screen.getByText('Summer Clash')).toBeTruthy();
    });
  });
});
