import { useState, useEffect, useContext, useMemo } from 'react';
import {
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { MemberContext } from '../../contexts/UserContext';
import {
  getTeams,
  sendJoinRequest,
  getTeamMembers,
} from '../../services/teamService';
import { TeamSummary, Memberdto } from '../../types';
import { useNavigate } from 'react-router-dom';

const TeamPage = () => {
  const { authenticatedMember } = useContext(MemberContext);
  const navigate = useNavigate();
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<{
    id: number;
    list: Memberdto[];
  } | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Set<number>>(
    new Set(),
  );
  const [confirmJoinTeamId, setConfirmJoinTeamId] = useState<number | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const currentTeamId = authenticatedMember?.teamId ?? null;

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) {
      return teams;
    }
    const query = searchQuery.toLowerCase().trim();
    return teams.filter((team) => team.nom.toLowerCase().includes(query));
  }, [teams, searchQuery]);

  useEffect(() => {
    getTeams(authenticatedMember?.token)
      .then(setTeams)
      .catch(() => {
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement des équipes',
          severity: 'error',
        });
      });
  }, [authenticatedMember]);

  const handleShowMembers = async (teamId: number) => {
    if (selectedTeamMembers?.id === teamId) {
      setSelectedTeamMembers(null);
    } else {
      try {
        const members = await getTeamMembers(
          teamId,
          authenticatedMember?.token,
        );
        setSelectedTeamMembers({ id: teamId, list: members });
      } catch {
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement des membres',
          severity: 'error',
        });
      }
    }
  };

  const handleJoinRequest = async (teamId: number) => {
    if (!authenticatedMember) return;

    try {
      await sendJoinRequest(teamId, authenticatedMember.token);
      setPendingRequests((prev) => new Set(prev).add(teamId));
      setSnackbar({
        open: true,
        message:
          'Demande envoyée ! En attente de validation par le responsable.',
        severity: 'success',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'envoi";
      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    }
  };

  const handleJoinClick = (teamId: number) => {
    if (currentTeamId) {
      setConfirmJoinTeamId(teamId);
      return;
    }
    void handleJoinRequest(teamId);
  };

  const handleConfirmJoinRequest = () => {
    const teamId = confirmJoinTeamId;
    setConfirmJoinTeamId(null);
    if (teamId !== null) {
      void handleJoinRequest(teamId);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        sx={{ color: '#c8aa6e', mb: 4, fontWeight: 'bold' }}
      >
        Équipes Vinci Arena
      </Typography>
      {!authenticatedMember && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            bgcolor: 'rgba(10, 200, 185, 0.08)',
            color: '#f0e6d2',
            border: '1px solid rgba(10, 200, 185, 0.3)',
          }}
        >
          Vous pouvez consulter les équipes et leurs membres. Connectez-vous
          pour envoyer une demande d&apos;adhésion.
        </Alert>
      )}

      {/* Barre de recherche */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher une équipe par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#c8aa6e' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(1, 10, 19, 0.8)',
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(200, 170, 110, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(200, 170, 110, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#c8aa6e',
              },
            },
            '& .MuiInputBase-input': {
              color: '#f0e6d2',
            },
          }}
        />
      </Box>

      {/* Résultats de recherche */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ color: '#a09b8c' }}>
          {filteredTeams.length} équipe{filteredTeams.length !== 1 ? 's' : ''}{' '}
          trouvée
          {filteredTeams.length !== 1 ? 's' : ''}
          {searchQuery && ` pour "${searchQuery}"`}
        </Typography>
      </Box>

      <Stack spacing={3}>
        {filteredTeams.map((team) => (
          <Card
            key={team.id}
            sx={{
              bgcolor: 'rgba(1, 10, 19, 0.8)',
              border: '1px solid rgba(200, 170, 110, 0.3)',
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ color: '#f0e6d2' }}>
                {team.nom}
              </Typography>
              <Typography sx={{ color: '#a09b8c' }}>
                Responsable : {team.responsible?.tag}
              </Typography>

              {/* Liste des membres dépliante */}
              {selectedTeamMembers?.id === team.id && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(0,0,0,0.3)',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#0ac8b9', mb: 1 }}
                  >
                    Joueurs inscrits :
                  </Typography>
                  {selectedTeamMembers.list.map((m) => (
                    <Typography
                      key={m.tag}
                      onClick={() => navigate(`/members/${m.id}`)}
                      sx={{
                        color: '#f0e6d2',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        '&:hover': { color: '#0ac8b9' },
                      }}
                    >
                      • {m.tag} ({m.specialty})
                    </Typography>
                  ))}
                </Box>
              )}
            </CardContent>

            <CardActions>
              <Button size="small" onClick={() => handleShowMembers(team.id)}>
                {selectedTeamMembers?.id === team.id
                  ? 'Masquer membres'
                  : 'Voir membres'}
              </Button>

              {/* Tout membre connecté peut demander à rejoindre une autre équipe. */}
              {authenticatedMember && team.id !== currentTeamId && (
                <Button
                  variant="contained"
                  color={pendingRequests.has(team.id) ? 'inherit' : 'primary'}
                  disabled={pendingRequests.has(team.id)}
                  onClick={() => handleJoinClick(team.id)}
                >
                  {pendingRequests.has(team.id)
                    ? 'Demande envoyée'
                    : currentTeamId
                      ? 'Demander à rejoindre'
                      : 'Rejoindre'}
                </Button>
              )}
            </CardActions>
          </Card>
        ))}
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmJoinTeamId !== null}
        onClose={() => setConfirmJoinTeamId(null)}
      >
        <DialogTitle>Confirmer la demande</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Si votre demande est acceptée, vous quitterez automatiquement votre
            équipe actuelle.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmJoinTeamId(null)}>Annuler</Button>
          <Button variant="contained" onClick={handleConfirmJoinRequest}>
            Continuer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeamPage;
