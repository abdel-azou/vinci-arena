import { createContext, useState, ReactNode, useEffect, useRef } from 'react';
import {
  MaybeAuthenticatedMember,
  AdminRoleUpdateResponse,
  AdminSummary,
  MemberContextType,
  Credentials,
  RegisterRequest,
  AuthenticatedMember,
  MemberRole,
  ChangePasswordRequest,
  UpdateSpecialtyRequest,
  UpdateProfileImageRequest,
  MemberUnavailability,
} from '../types';

import {
  clearAuthenticatedMember,
  storeAuthenticatedMember,
  getAuthenticatedMember,
  isAuthenticatedMemberRemembered,
} from '../utils/session';
import {
  login,
  refreshAuthenticatedMember,
  register,
} from '../services/authService';
import {
  changePassword as changePasswordRequest,
  createUnavailability as createUnavailabilityRequest,
  deleteUnavailability as deleteUnavailabilityRequest,
  getAdmins as getAdminsRequest,
  getMyUnavailabilities as getMyUnavailabilitiesRequest,
  promoteMemberToAdmin as promoteMemberToAdminRequest,
  removeMemberAdminRole as removeMemberAdminRoleRequest,
  searchMembers as searchMembersRequest,
  updateProfileImage as updateProfileImageRequest,
  updateSpecialty as updateSpecialtyRequest,
} from '../services/memberService';
import {
  buildMemberWithRole,
  buildMemberWithTeamId,
  persistAuthenticatedMember,
  withSessionGuard,
} from './memberContextUtils';

const defaultMemberContext: MemberContextType = {
  authenticatedMember: undefined,
  registerMember: async () => {},
  loginMember: async () => {},
  clearMember: () => {},
  updateMemberRole: () => {},
  changePassword: async () => {},
  updateSpecialty: async () => {},
  updateProfileImage: async () => {},
  updateTeamId: () => {},
  getMyUnavailabilities: async () => [],
  createUnavailability: async () => ({ id: 0, startDate: '', endDate: '' }),
  deleteUnavailability: async () => {},
  promoteMemberToAdmin: async () => ({ message: '', role: 'MEMBER' }),
  removeMemberAdminRole: async () => ({ message: '', role: 'MEMBER' }),
  getAdmins: async () => [],
  searchMembers: async () => [],
};

const MemberContext = createContext<MemberContextType>(defaultMemberContext);

const MemberContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedMember, setAuthenticatedMember] =
    useState<MaybeAuthenticatedMember>(undefined);
  const didFetchRef = useRef(false);

  const clearMember = () => {
    clearAuthenticatedMember();
    setAuthenticatedMember(undefined);
  };

  // Restore session on mount + validate token with /members/me
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const storedMember = getAuthenticatedMember();
    if (!storedMember) return;

    setAuthenticatedMember(storedMember);

    refreshAuthenticatedMember(storedMember.token)
      .then((refreshedMember: AuthenticatedMember) => {
        setAuthenticatedMember(refreshedMember);
        storeAuthenticatedMember(
          refreshedMember,
          isAuthenticatedMemberRemembered(),
        );
      })
      .catch(() => {
        clearMember();
      });
  }, []);

  const registerMember = async (request: RegisterRequest) => {
    await register(request);
  };

  const loginMember = async (
    credentials: Credentials,
    rememberMe: boolean = false,
  ) => {
    const member = await login(credentials, rememberMe);
    setAuthenticatedMember(member);
    storeAuthenticatedMember(member, rememberMe);
  };

  const updateMemberRole = (newRole: MemberRole) => {
    setAuthenticatedMember((previousMember) => {
      if (!previousMember) return previousMember;

      const updatedMember = buildMemberWithRole(previousMember, newRole);
      persistAuthenticatedMember(updatedMember);
      return updatedMember;
    });
  };

  const updateTeamId = (teamId: number | null) => {
    setAuthenticatedMember((previousMember) => {
      if (!previousMember) return previousMember;

      const updatedMember = buildMemberWithTeamId(previousMember, teamId);
      persistAuthenticatedMember(updatedMember);
      return updatedMember;
    });
  };

  const changePassword = async (request: ChangePasswordRequest) => {
    await withSessionGuard(() => changePasswordRequest(request), clearMember);
  };

  const updateSpecialty = async (request: UpdateSpecialtyRequest) => {
    const updatedMember = await withSessionGuard(
      () => updateSpecialtyRequest(request),
      clearMember,
    );
    setAuthenticatedMember(updatedMember);
    persistAuthenticatedMember(updatedMember);
  };

  const updateProfileImage = async (request: UpdateProfileImageRequest) => {
    const updatedMember = await withSessionGuard(
      () => updateProfileImageRequest(request),
      clearMember,
    );
    setAuthenticatedMember(updatedMember);
    persistAuthenticatedMember(updatedMember);
  };

  const getMyUnavailabilities = async (): Promise<MemberUnavailability[]> => {
    return withSessionGuard(() => getMyUnavailabilitiesRequest(), clearMember);
  };

  const createUnavailability = async (
    startDate: string,
    endDate: string,
  ): Promise<MemberUnavailability> => {
    return withSessionGuard(
      () => createUnavailabilityRequest(startDate, endDate),
      clearMember,
    );
  };

  const deleteUnavailability = async (id: number) => {
    await withSessionGuard(() => deleteUnavailabilityRequest(id), clearMember);
  };

  const promoteMemberToAdmin = async (
    targetEmail: string,
  ): Promise<AdminRoleUpdateResponse> => {
    return withSessionGuard(
      () => promoteMemberToAdminRequest(targetEmail),
      clearMember,
    );
  };

  const removeMemberAdminRole = async (
    targetEmail: string,
  ): Promise<AdminRoleUpdateResponse> => {
    return withSessionGuard(
      () => removeMemberAdminRoleRequest(targetEmail),
      clearMember,
    );
  };

  const getAdmins = async (): Promise<AdminSummary[]> => {
    return withSessionGuard(() => getAdminsRequest(), clearMember);
  };

  const searchMembers = async (query: string): Promise<AdminSummary[]> => {
    return withSessionGuard(() => searchMembersRequest(query), clearMember);
  };

  const myContext: MemberContextType = {
    authenticatedMember,
    registerMember,
    loginMember,
    clearMember,
    updateMemberRole,
    changePassword,
    updateSpecialty,
    updateProfileImage,
    updateTeamId,
    getMyUnavailabilities,
    createUnavailability,
    deleteUnavailability,
    promoteMemberToAdmin,
    removeMemberAdminRole,
    getAdmins,
    searchMembers,
  };

  return (
    <MemberContext.Provider value={myContext}>
      {children}
    </MemberContext.Provider>
  );
};

export { MemberContext, MemberContextProvider };
