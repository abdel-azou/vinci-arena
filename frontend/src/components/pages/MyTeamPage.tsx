import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Snackbar,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { MemberContext } from '../../contexts/UserContext';
import { TeamContext } from '../../contexts/TeamContext';
import { assignSecondResponsible, getTeams } from '../../services/teamService';
import { MemberContextType, SPECIALTY_LABELS, TeamSummary } from '../../types';
import TeamMembersList from './TeamPage/TeamMembersList';
import JoinRequestsList from './TeamPage/JoinRequestsList';
import TeamTournamentsCard from './TeamPage/TeamTournamentsCard';

const MyTeamPage = () => {
  const { authenticatedMember, updateMemberRole, updateTeamId } =
    useContext<MemberContextType>(MemberContext);
  const {
    members,
    joinRequests,
    loading,
    error,
    actionLoading,
    isResponsible,
    refresh,
    handleManageRequest,
    handleLeaveTeam,
    clearError,
  } = useContext(TeamContext);

  const navigate = useNavigate();
  const [currentTeam, setCurrentTeam] = useState<TeamSummary | null>(null);
  const [selectedSecondResponsibleId, setSelectedSecondResponsibleId] =
    useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const loadCurrentTeam = useCallback(async () => {
    if (!authenticatedMember?.teamId) {
      setCurrentTeam(null);
      return;
    }

    try {
      const teams = await getTeams(authenticatedMember.token);
      const team = teams.find((item) => item.id === authenticatedMember.teamId);
      setCurrentTeam(team ?? null);
    } catch {
      setCurrentTeam(null);
    }
  }, [authenticatedMember?.teamId, authenticatedMember?.token]);

  useEffect(() => {
    if (!authenticatedMember) {
      navigate('/login');
    } else if (!authenticatedMember.teamId) {
      navigate('/teams');
    }
  }, [authenticatedMember, navigate]);

  useEffect(() => {
    if (authenticatedMember?.teamId) {
      void loadCurrentTeam();
    }
  }, [authenticatedMember?.teamId, loadCurrentTeam]);

  const canManageSecondResponsible =
    !!authenticatedMember &&
    (isResponsible ||
      currentTeam?.responsible?.tag === authenticatedMember.tag ||
      currentTeam?.secondResponsible?.tag === authenticatedMember.tag);
  const canManageTeamRequests =
    !!authenticatedMember &&
    (isResponsible ||
      currentTeam?.responsible?.tag === authenticatedMember.tag ||
      currentTeam?.secondResponsible?.tag === authenticatedMember.tag);
  const canLeaveTeam = true;

  const onLeaveTeam = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir quitter cette équipe ?')) {
      return;
    }
    const updatedMember = await handleLeaveTeam();
    if (updatedMember) {
      const nextRole = updatedMember.role;

      updateMemberRole(nextRole);
      updateTeamId(updatedMember.teamId ?? null);
      window.location.assign('/teams');
    }
  };

  const eligibleMembers = useMemo(
    () => members.filter((member) => member.tag !== authenticatedMember?.tag),
    [members, authenticatedMember?.tag],
  );

  const handleRefresh = () => {
    refresh();
    void loadCurrentTeam();
  };

  const handleAssignSecondResponsible = async () => {
    if (!authenticatedMember || !selectedSecondResponsibleId) {
      setFeedback({
        open: true,
        message: 'Veuillez sélectionner un membre',
        severity: 'error',
      });
      return;
    }

    try {
      setAssignLoading(true);
      const updatedTeam = await assignSecondResponsible(
        Number(selectedSecondResponsibleId),
        authenticatedMember.token,
      );
      setCurrentTeam(updatedTeam);
      setSelectedSecondResponsibleId('');
      refresh();
      setFeedback({
        open: true,
        message: 'Second responsable mis à jour',
        severity: 'success',
      });
    } catch (err) {
      setFeedback({
        open: true,
        message:
          err instanceof Error
            ? err.message
            : 'Erreur lors de la mise à jour du second responsable',
        severity: 'error',
      });
    } finally {
      setAssignLoading(false);
    }
  };

  if (!authenticatedMember || !authenticatedMember.teamId) {
    return null;
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#c8aa6e' }} />
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant="h4"
            sx={{ color: '#c8aa6e', fontWeight: 'bold' }}
          >
            Ma Team
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ color: '#a09b8c' }}
          >
            Actualiser
          </Button>

          <Button
            onClick={() => navigate('/teams')}
            sx={{
              color: '#0ac8b9',
              '&:hover': {
                bgcolor: 'rgba(10, 200, 185, 0.1)',
              },
            }}
          >
            voir rivaux
          </Button>
        </Box>

        {canLeaveTeam && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<ExitToAppIcon />}
            onClick={onLeaveTeam}
          >
            Quitter l'équipe
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Team Members */}
      <TeamMembersList members={members} />

      {/* Second responsible management (main or second responsible) */}
      {canManageSecondResponsible && (
        <Card
          sx={{
            bgcolor: 'rgba(1, 10, 19, 0.8)',
            border: '1px solid rgba(200, 170, 110, 0.3)',
            mb: 4,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{ color: '#c8aa6e', mb: 2, fontWeight: 600 }}
            >
              Second responsable
            </Typography>

            <Typography sx={{ color: '#f0e6d2', mb: 2 }}>
              Actuel :{' '}
              {currentTeam?.secondResponsible?.tag ??
                'Aucun second responsable'}
            </Typography>

            {eligibleMembers.length > 0 ? (
              <>
                <TextField
                  select
                  fullWidth
                  label="Membre"
                  InputLabelProps={{ shrink: true }}
                  value={selectedSecondResponsibleId}
                  onChange={(event) =>
                    setSelectedSecondResponsibleId(event.target.value)
                  }
                  SelectProps={{ native: true }}
                  sx={{ mb: 2 }}
                >
                  <option value="">Sélectionner un membre</option>
                  {eligibleMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.tag} ({SPECIALTY_LABELS[member.specialty]})
                    </option>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  onClick={handleAssignSecondResponsible}
                  disabled={assignLoading || !selectedSecondResponsibleId}
                >
                  {currentTeam?.secondResponsible
                    ? 'Remplacer le second responsable'
                    : 'Nommer le second responsable'}
                </Button>
              </>
            ) : (
              <Typography sx={{ color: '#a09b8c' }}>
                Aucun membre éligible à nommer.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Join Requests (responsible principal or secondaire) */}
      {canManageTeamRequests && (
        <JoinRequestsList
          joinRequests={joinRequests}
          actionLoading={actionLoading}
          onManageRequest={handleManageRequest}
        />
      )}

      {currentTeam && (
        <TeamTournamentsCard
          teamName={currentTeam.nom}
          registeredTournamentNames={
            currentTeam.registeredTournamentNames ?? []
          }
        />
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={5000}
        onClose={() =>
          setFeedback((previous) => ({ ...previous, open: false }))
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={feedback.severity}
          sx={{ width: '100%' }}
          onClose={() =>
            setFeedback((previous) => ({ ...previous, open: false }))
          }
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyTeamPage;
