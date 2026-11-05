import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import LoginPage from './LoginPage';
import { MemberContext } from '../../contexts/UserContext';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LoginPage', () => {
  const defaultMockContext = {
    changePassword: vi.fn(),
    authenticatedMember: undefined,
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
  };

  test('renders a form with email and password inputs', () => {
    render(
      <MemoryRouter>
        <MemberContext.Provider value={defaultMockContext}>
          <LoginPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  test('calls loginMember and navigates to HomePage when the form is submitted', async () => {
    const loginMemberMock = vi.fn();
    const navigateMock = vi.fn();
    const mockContextValue = {
      changePassword: vi.fn(),
      authenticatedMember: undefined,
      registerMember: vi.fn(),
      loginMember: loginMemberMock,
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
    };

    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    render(
      <MemoryRouter>
        <MemberContext.Provider value={mockContextValue}>
          <LoginPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', {
      name: /entrer/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    expect(loginMemberMock).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        password: 'password123',
      },
      false,
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('displays error message when loginMember fails', async () => {
    const loginMemberMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Email ou mot de passe incorrect'));
    const mockContextValue = {
      changePassword: vi.fn(),
      authenticatedMember: undefined,
      registerMember: vi.fn(),
      loginMember: loginMemberMock,
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
    };

    render(
      <MemoryRouter>
        <MemberContext.Provider value={mockContextValue}>
          <LoginPage />
        </MemberContext.Provider>
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', {
      name: /entrer/i,
    });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email ou mot de passe incorrect/i)).toBeTruthy();
    });
  });
});
