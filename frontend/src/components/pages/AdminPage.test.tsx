import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AdminPage from './AdminPage';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';

const getAdmins = vi.fn();
const promoteMemberToAdmin = vi.fn();
const removeMemberAdminRole = vi.fn();
const searchMembers = vi.fn();

const buildMemberContext = (
  overrides?: Partial<MemberContextType>,
): MemberContextType => ({
  authenticatedMember: {
    id: 1,
    email: 'admin@mail.com',
    tag: 'Admin',
    specialty: 'TACTICIAN',
    token: 'token',
    role: 'ADMIN',
    teamId: null,
  },
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
  promoteMemberToAdmin,
  removeMemberAdminRole,
  getAdmins,
  searchMembers,
  ...overrides,
});

const renderPage = (overrides?: Partial<MemberContextType>) => {
  render(
    <MemoryRouter initialEntries={['/gestion']}>
      <MemberContext.Provider value={buildMemberContext(overrides)}>
        <Routes>
          <Route path="/gestion" element={<AdminPage />} />
          <Route path="/members/:id" element={<div>Profil public</div>} />
          <Route path="/login" element={<div>Login</div>} />
          <Route path="/" element={<div>Accueil</div>} />
        </Routes>
      </MemberContext.Provider>
    </MemoryRouter>,
  );
};

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdmins.mockResolvedValue([
      { id: 1, tag: 'Admin', email: 'admin@mail.com' },
      { id: 2, tag: 'Lynx', email: 'user@mail.com' },
    ]);
    searchMembers.mockResolvedValue([
      { id: 2, tag: 'Lynx', email: 'user@mail.com' },
    ]);
  });

  test('allows adding an admin from the management page', async () => {
    promoteMemberToAdmin.mockResolvedValue({
      message: 'Statut admin attribue',
      role: 'ADMIN',
    });

    renderPage();

    expect(await screen.findByText('Lynx')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Email ou tag du membre'), {
      target: { value: '  USER@MAIL.COM  ' },
    });
    expect(
      (await screen.findAllByText('user@mail.com')).length,
    ).toBeGreaterThan(0);
    fireEvent.click(
      screen.getByRole('button', { name: /Lynx\s+user@mail.com/i }),
    );
    fireEvent.click(screen.getByText('Nommer admin'));

    await waitFor(() => {
      expect(promoteMemberToAdmin).toHaveBeenCalledWith('user@mail.com');
    });
    expect(await screen.findByText(/Statut admin attribue/)).toBeTruthy();
  });

  test('removes an admin without navigating to the public profile', async () => {
    removeMemberAdminRole.mockResolvedValue({
      message: 'Statut admin retire',
      role: 'MEMBER',
    });

    renderPage();

    expect(await screen.findByText('Lynx')).toBeTruthy();

    fireEvent.click(screen.getAllByText('Retirer admin')[1]);

    await waitFor(() => {
      expect(removeMemberAdminRole).toHaveBeenCalledWith('user@mail.com');
    });
    expect(screen.queryByText('Profil public')).toBeNull();
    expect(await screen.findByText(/Statut admin retire/)).toBeTruthy();
  });
});
