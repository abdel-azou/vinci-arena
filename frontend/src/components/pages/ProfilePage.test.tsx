import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProfilePage from './ProfilePage';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';
import { getTeams } from '../../services/teamService';
import { getPublicMemberProfile } from '../../services/memberService';

vi.mock('../../services/teamService', () => ({
  getTeams: vi.fn(),
}));

vi.mock('../../services/memberService', () => ({
  getPublicMemberProfile: vi.fn(),
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
  getMyUnavailabilities: vi.fn().mockResolvedValue([]),
  createUnavailability: vi.fn(),
  deleteUnavailability: vi.fn(),
  promoteMemberToAdmin: vi.fn(),
  removeMemberAdminRole: vi.fn(),
  getAdmins: vi.fn(),
  searchMembers: vi.fn(),
  ...overrides,
});

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTeams).mockResolvedValue([
      { id: 4, nom: 'TEAM_ALPHA' } as never,
    ]);
    vi.mocked(getPublicMemberProfile).mockResolvedValue({
      id: 1,
      tag: 'PlayerOne',
      specialty: 'TACTICIAN',
      role: 'MEMBER',
      tournaments: [
        {
          id: 42,
          name: 'Vinci Cup',
          startDate: '2026-04-18T10:00:00',
          endDate: '2026-04-20T18:00:00',
          status: 'INSCRIPTION',
        },
      ],
    } as never);
  });

  test('switches from the general view to the tournaments view', async () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <MemberContext.Provider
          value={buildMemberContext({
            authenticatedMember: {
              id: 1,
              email: 'player@mail.com',
              tag: 'PlayerOne',
              specialty: 'TACTICIAN',
              token: 'token',
              role: 'MEMBER',
              teamId: 4,
            },
          })}
        >
          <ProfilePage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Vue generale')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /voir mes tournois/i }));

    await waitFor(() => {
      expect(screen.getByText('Mes tournois')).toBeTruthy();
      expect(screen.queryByText('Vue generale')).toBeNull();
    });
  });
});
