import { ComponentProps } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import MyTeamPage from './MyTeamPage';
import { MemberContext } from '../../contexts/UserContext';
import { TeamContext } from '../../contexts/TeamContext';
import { MemberContextType } from '../../types';
import { assignSecondResponsible, getTeams } from '../../services/teamService';

vi.mock('../../services/teamService', () => ({
  getTeams: vi.fn(),
  assignSecondResponsible: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

type TeamContextValue = ComponentProps<typeof TeamContext.Provider>['value'];

const buildMemberContext = (
  overrides?: Partial<MemberContextType>,
): MemberContextType => ({
  authenticatedMember: {
    id: 1,
    email: 'captain@mail.com',
    tag: 'captain',
    specialty: 'TACTICIAN',
    token: 'token-123',
    role: 'RESPONSIBLE',
    teamId: 10,
  },
  registerMember: vi.fn(),
  loginMember: vi.fn(),
  clearMember: vi.fn(),
  updateMemberRole: vi.fn(),
  changePassword: vi.fn(),
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

const buildTeamContext = (
  overrides?: Partial<TeamContextValue>,
): TeamContextValue => ({
  members: [
    { id: 1, tag: 'captain', specialty: 'TACTICIAN', role: 'RESPONSIBLE' },
    { id: 2, tag: 'player2', specialty: 'ARCHITECT', role: 'MEMBER' },
  ],
  joinRequests: [],
  loading: false,
  error: null,
  actionLoading: null,
  isResponsible: true,
  refresh: vi.fn(),
  handleManageRequest: vi.fn(),
  handleLeaveTeam: vi.fn(),
  clearError: vi.fn(),
  ...overrides,
});

const renderPage = (
  memberOverrides?: Partial<MemberContextType>,
  teamOverrides?: Partial<TeamContextValue>,
) => {
  const memberContextValue = buildMemberContext(memberOverrides);
  const teamContextValue = buildTeamContext(teamOverrides);

  render(
    <MemoryRouter>
      <MemberContext.Provider value={memberContextValue}>
        <TeamContext.Provider value={teamContextValue}>
          <MyTeamPage />
        </TeamContext.Provider>
      </MemberContext.Provider>
    </MemoryRouter>,
  );

  return { memberContextValue, teamContextValue };
};

describe('MyTeamPage - second responsible management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(vi.fn());
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  test('shows the section for main responsible', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);

    renderPage();

    expect(await screen.findByText('Second responsable')).toBeTruthy();
  });

  test('shows the section for an admin who is also responsible', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);

    renderPage(
      {
        authenticatedMember: {
          id: 1,
          email: 'captain@mail.com',
          tag: 'captain',
          specialty: 'TACTICIAN',
          token: 'token-123',
          role: 'ADMIN',
          isResponsible: true,
          teamId: 10,
        },
      },
      {
        isResponsible: false,
      },
    );

    expect(await screen.findByText('Second responsable')).toBeTruthy();
  });

  test('shows join requests for an admin who is also responsible', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);

    renderPage(
      {
        authenticatedMember: {
          id: 1,
          email: 'captain@mail.com',
          tag: 'captain',
          specialty: 'TACTICIAN',
          token: 'token-123',
          role: 'ADMIN',
          isResponsible: true,
          teamId: 10,
        },
      },
      {
        isResponsible: false,
        joinRequests: [
          {
            id: 42,
            memberTag: 'candidate',
            status: 'PENDING',
            createdAt: '2026-03-30T10:00:00',
          },
        ],
      },
    );

    expect(await screen.findByText("Demandes d'adhésion (1)")).toBeTruthy();
    expect(await screen.findByText('candidate')).toBeTruthy();
  });

  test('shows the section when the connected responsible is second responsible', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'someone-else' },
        secondResponsible: { id: 101, tag: 'captain' },
      },
    ]);

    renderPage();

    expect(await screen.findByText('Second responsable')).toBeTruthy();
  });

  test('hides the section for non-responsible members', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'someone-else' },
        secondResponsible: { id: 101, tag: 'another-responsible' },
      },
    ]);

    renderPage(
      {
        authenticatedMember: {
          id: 1,
          email: 'member@mail.com',
          tag: 'captain',
          specialty: 'TACTICIAN',
          token: 'token-123',
          role: 'MEMBER',
          teamId: 10,
        },
      },
      {
        isResponsible: false,
      },
    );

    await waitFor(() => {
      expect(screen.queryByText('Second responsable')).toBeNull();
    });
  });

  test('selecting a member and submitting calls assignSecondResponsible', async () => {
    const refreshMock = vi.fn();
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);
    vi.mocked(assignSecondResponsible).mockResolvedValueOnce({
      id: 10,
      nom: 'Vinci',
      responsible: { id: 100, tag: 'captain' },
      secondResponsible: { id: 102, tag: 'player2' },
    });

    const { memberContextValue } = renderPage(undefined, {
      refresh: refreshMock,
    });

    await screen.findByText('Second responsable');

    fireEvent.change(screen.getByRole('combobox', { name: /membre/i }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /nommer/i }));

    await waitFor(() => {
      expect(assignSecondResponsible).toHaveBeenCalledWith(
        2,
        memberContextValue.authenticatedMember!.token,
      );
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  test('shows success and updates displayed second responsible after assignment', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);
    vi.mocked(assignSecondResponsible).mockResolvedValueOnce({
      id: 10,
      nom: 'Vinci',
      responsible: { id: 100, tag: 'captain' },
      secondResponsible: { id: 102, tag: 'player2' },
    });

    renderPage();
    await screen.findByText('Second responsable');

    fireEvent.change(screen.getByRole('combobox', { name: /membre/i }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /nommer/i }));

    expect(
      await screen.findByText('Second responsable mis à jour'),
    ).toBeTruthy();
    expect(await screen.findByText(/Actuel :\s*player2/)).toBeTruthy();
  });

  test('displays backend error message when assignment fails', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);
    vi.mocked(assignSecondResponsible).mockRejectedValueOnce(
      new Error('Le membre doit appartenir à votre équipe'),
    );

    renderPage();
    await screen.findByText('Second responsable');

    fireEvent.change(screen.getByRole('combobox', { name: /membre/i }), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: /nommer/i }));

    expect(
      await screen.findByText('Le membre doit appartenir à votre équipe'),
    ).toBeTruthy();
  });

  test('shows leave button for the last main responsible', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);

    renderPage(undefined, {
      members: [
        { id: 1, tag: 'captain', specialty: 'TACTICIAN', role: 'RESPONSIBLE' },
      ],
    });

    expect(
      await screen.findByRole('button', { name: /quitter l'équipe/i }),
    ).toBeTruthy();
  });

  test('shows leave button for the main responsible even when other members exist', async () => {
    vi.mocked(getTeams).mockResolvedValueOnce([
      {
        id: 10,
        nom: 'Vinci',
        responsible: { id: 100, tag: 'captain' },
        secondResponsible: null,
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('button', { name: /quitter l'équipe/i }),
    ).toBeTruthy();
  });
});
