import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type Props = {
  confirmNewPassword: string;
  currentPassword: string;
  errorMessage: string;
  loading: boolean;
  newPassword: string;
  onChangePassword: () => void;
  onConfirmNewPasswordChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  successMessage: string;
};

const ProfileSecuritySection = ({
  confirmNewPassword,
  currentPassword,
  errorMessage,
  loading,
  newPassword,
  onChangePassword,
  onConfirmNewPasswordChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  successMessage,
}: Props) => (
  <Stack spacing={2.5}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="overline"
        sx={{ color: '#c8aa6e', letterSpacing: 1.2 }}
      >
        Securite
      </Typography>
      <Typography variant="h5" sx={{ color: '#f0e6d2', fontWeight: 700 }}>
        Changer le mot de passe
      </Typography>
      <Typography sx={{ mt: 1, color: 'rgba(240, 230, 210, 0.7)' }}>
        Renseigne ton mot de passe actuel puis choisis-en un nouveau.
      </Typography>
    </Box>

    {successMessage && <Alert severity="success">{successMessage}</Alert>}
    {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'rgba(200, 170, 110, 0.05)',
        borderColor: 'rgba(200, 170, 110, 0.2)',
      }}
    >
      <Stack spacing={2}>
        <TextField
          label="Mot de passe actuel"
          type="password"
          value={currentPassword}
          onChange={(e) => onCurrentPasswordChange(e.target.value)}
          fullWidth
        />
        <TextField
          label="Nouveau mot de passe"
          type="password"
          value={newPassword}
          onChange={(e) => onNewPasswordChange(e.target.value)}
          fullWidth
        />
        <TextField
          label="Confirmer le nouveau mot de passe"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => onConfirmNewPasswordChange(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          onClick={onChangePassword}
          disabled={loading}
          sx={{ mt: 1 }}
        >
          {loading ? 'Mise a jour...' : 'Enregistrer le nouveau mot de passe'}
        </Button>
      </Stack>
    </Paper>
  </Stack>
);

export default ProfileSecuritySection;
