import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import PublicProfilePage from './PublicProfilePage';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';

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
    <MemoryRouter initialEntries={['/members/7']}>
      <MemberContext.Provider value={buildMemberContext(overrides)}>
        <Routes>
          <Route path="/members/:id" element={<PublicProfilePage />} />
          <Route path="/profile" element={<div>Mon profil</div>} />
        </Routes>
      </MemberContext.Provider>
    </MemoryRouter>,
  );
};

describe('PublicProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows a public member profile to visitors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          id: 7,
          tag: 'Lynx',
          specialty: 'TACTICIAN',
          teamName: 'TEAM_ALPHA',
          tournaments: [
            {
              id: 12,
              name: 'Vinci Easter Cup 2026',
              startDate: '2026-04-18T10:00:00',
              endDate: '2026-04-20T18:00:00',
              status: 'INSCRIPTION',
            },
          ],
          role: 'ADMIN',
          createdAt: '2025-11-12T10:00:00',
        }),
      }),
    );

    renderPage();

    expect((await screen.findAllByText('Lynx')).length).toBeGreaterThan(0);
    expect(screen.getByText('TEAM_ALPHA')).toBeTruthy();
    expect(screen.getByText('Vinci Easter Cup 2026')).toBeTruthy();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/members/7', {
        headers: undefined,
      });
    });

    expect(screen.queryByText('Bannir ce membre')).toBeNull();
  });

  test('redirects an admin to their own private profile instead of showing ban actions', async () => {
    vi.stubGlobal('fetch', vi.fn());

    renderPage({
      authenticatedMember: {
        id: 7,
        email: 'admin@mail.com',
        tag: 'Admin',
        specialty: 'TACTICIAN',
        token: 'token',
        role: 'ADMIN',
        teamId: null,
      },
    });

    expect(await screen.findByText('Mon profil')).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });
});
