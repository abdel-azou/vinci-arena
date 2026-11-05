import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';
import { createTeam } from '../../services/teamService';

const CreateTeamPage = () => {
  const { authenticatedMember, updateMemberRole, updateTeamId } =
    useContext<MemberContextType>(MemberContext);
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if user is not logged in or already a responsible
  useEffect(() => {
    if (!authenticatedMember) {
      navigate('/login');
      return;
    }

    if (
      authenticatedMember.role === 'RESPONSIBLE' ||
      authenticatedMember.isResponsible
    ) {
      navigate('/');
    }
  }, [authenticatedMember, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      setError("Le nom de l'équipe est requis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdTeam = await createTeam(teamName.trim());
      updateMemberRole('RESPONSIBLE');
      updateTeamId(createdTeam.id);
      setSuccess(true);

      // Redirect to home after a short delay to show success message
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la création',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError(null);
  };

  // Don't render if not authenticated or already responsible
  if (
    !authenticatedMember ||
    authenticatedMember.role === 'RESPONSIBLE' ||
    authenticatedMember.isResponsible
  ) {
    return null;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          borderRadius: 2,
          background:
            'linear-gradient(180deg, rgba(10, 20, 40, 0.9) 0%, rgba(1, 10, 19, 0.9) 100%)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: 'linear-gradient(180deg, #f0e6d2 0%, #c8aa6e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
          }}
        >
          Créer une équipe
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="teamName"
            label="Nom de l'équipe"
            name="teamName"
            autoFocus
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={loading}
            error={!!error}
            helperText={error}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || !teamName.trim()}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Créer l'équipe"
            )}
          </Button>
        </Box>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
        >
          Équipe créée avec succès ! Vous êtes maintenant responsable.
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error && !loading}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateTeamPage;
