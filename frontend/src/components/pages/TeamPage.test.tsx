import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TeamPage from './TeamPage';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';
import { getTeamMembers, getTeams } from '../../services/teamService';

vi.mock('../../services/teamService', () => ({
  getTeams: vi.fn(),
  getTeamMembers: vi.fn(),
  sendJoinRequest: vi.fn(),
}));

const buildMemberContext = (
  overrides?: Partial<MemberContextType>,
): MemberContextType => ({
  authenticatedMember: undefined,
  registerMember: vi.fn(),
  loginMember: vi.fn(),
  changePassword: vi.fn(),
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

const renderPage = (overrides?: Partial<MemberContextType>) => {
  render(
    <MemoryRouter>
      <MemberContext.Provider value={buildMemberContext(overrides)}>
        <TeamPage />
      </MemberContext.Provider>
    </MemoryRouter>,
  );
};

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows teams to visitors without the join button', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'TEAM_ALPHA',
        responsible: { id: 1, tag: 'Lynx' },
        secondResponsible: null,
        registeredTournamentNames: ['Vinci Easter Cup 2026'],
      },
    ]);

    renderPage();

    expect(await screen.findByText('TEAM_ALPHA')).toBeTruthy();
    expect(
      screen.getByText(/vous pouvez consulter les équipes et leurs membres/i),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: /rejoindre/i })).toBeNull();
  });

  test('loads team members for a visitor', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'TEAM_ALPHA',
        responsible: { id: 1, tag: 'Lynx' },
        secondResponsible: null,
        registeredTournamentNames: ['Vinci Easter Cup 2026'],
      },
    ]);
    vi.mocked(getTeamMembers).mockResolvedValueOnce([
      {
        id: 1,
        tag: 'Lynx',
        specialty: 'TACTICIAN',
        role: 'ADMIN',
      },
    ]);

    renderPage();

    fireEvent.click(
      await screen.findByRole('button', { name: /voir membres/i }),
    );

    await waitFor(() => {
      expect(getTeamMembers).toHaveBeenCalledWith(10, undefined);
    });
    expect(await screen.findByText(/lynx \(TACTICIAN\)/i)).toBeTruthy();
  });
});
