/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';
import { MemberContext } from './UserContext';
import {
  getTeamMembers,
  getMyJoinRequests,
  manageJoinRequest,
  leaveTeam,
} from '../services/teamService';
import {
  AuthenticatedMember,
  Memberdto,
  JoinRequest,
  MemberContextType,
} from '../types';

interface TeamContextType {
  members: Memberdto[];
  joinRequests: JoinRequest[];
  loading: boolean;
  error: string | null;
  actionLoading: number | null;
  isResponsible: boolean;
  refresh: () => void;
  handleManageRequest: (
    requestId: number,
    action: 'accept' | 'reject',
    reason?: string,
  ) => Promise<void>;
  handleLeaveTeam: () => Promise<AuthenticatedMember | null>;
  clearError: () => void;
}

export const TeamContext = createContext<TeamContextType>({
  members: [],
  joinRequests: [],
  loading: false,
  error: null,
  actionLoading: null,
  isResponsible: false,
  refresh: () => {},
  handleManageRequest: async () => {},
  handleLeaveTeam: async () => null,
  clearError: () => {},
});

interface TeamProviderProps {
  children: ReactNode;
}

export const TeamProvider = ({ children }: TeamProviderProps) => {
  const { authenticatedMember } = useContext<MemberContextType>(MemberContext);

  const [members, setMembers] = useState<Memberdto[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [resolvedResponsible, setResolvedResponsible] = useState(false);

  const sessionSaysResponsible =
    authenticatedMember?.isResponsible ||
    authenticatedMember?.role === 'RESPONSIBLE';

  const fetchData = useCallback(async () => {
    if (!authenticatedMember || !authenticatedMember.teamId) {
      setMembers([]);
      setJoinRequests([]);
      setResolvedResponsible(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResolvedResponsible(Boolean(sessionSaysResponsible));

      const membersData = await getTeamMembers(
        authenticatedMember.teamId,
        authenticatedMember.token,
      );
      setMembers(membersData);

      try {
        const requestsData = await getMyJoinRequests(authenticatedMember.token);
        setJoinRequests(requestsData.filter((r) => r.status === 'PENDING'));
        setResolvedResponsible(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (
          !sessionSaysResponsible ||
          message === "Vous n'êtes responsable d'aucune équipe"
        ) {
          setJoinRequests([]);
          setResolvedResponsible(false);
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors du chargement',
      );
    } finally {
      setLoading(false);
    }
  }, [authenticatedMember, sessionSaysResponsible]);

  // Fetch data when teamId changes
  useEffect(() => {
    if (authenticatedMember?.teamId) {
      fetchData();
    } else {
      setMembers([]);
      setJoinRequests([]);
      setResolvedResponsible(false);
    }
  }, [authenticatedMember?.teamId, fetchData]);

  const refresh = () => {
    fetchData();
  };

  const handleManageRequest = async (
    requestId: number,
    action: 'accept' | 'reject',
    reason?: string,
  ) => {
    if (!authenticatedMember) return;

    setActionLoading(requestId);
    try {
      await manageJoinRequest(
        requestId,
        action,
        authenticatedMember.token,
        reason,
      );
      setJoinRequests((prev) => prev.filter((r) => r.id !== requestId));

      // Refresh members list if accepted
      if (action === 'accept' && authenticatedMember.teamId) {
        const membersData = await getTeamMembers(
          authenticatedMember.teamId,
          authenticatedMember.token,
        );
        setMembers(membersData);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors du traitement',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveTeam = async (): Promise<AuthenticatedMember | null> => {
    if (!authenticatedMember) return null;

    try {
      const updatedMember = await leaveTeam(authenticatedMember.token);
      setMembers([]);
      setJoinRequests([]);
      return updatedMember;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la sortie de l'équipe",
      );
      return null;
    }
  };

  const clearError = () => setError(null);

  return (
    <TeamContext.Provider
      value={{
        members,
        joinRequests,
        loading,
        error,
        actionLoading,
        isResponsible: resolvedResponsible,
        refresh,
        handleManageRequest,
        handleLeaveTeam,
        clearError,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};
