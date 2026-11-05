import { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  MemberContextType,
  Specialty,
  SPECIALTIES,
  SPECIALTY_LABELS,
} from '../../types';
import { MemberContext } from '../../contexts/UserContext';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caracteres';
  }

  if (!/\d/.test(password)) {
    return 'Le mot de passe doit contenir au moins un chiffre';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Le mot de passe doit contenir au moins un caractere special';
  }

  return null;
};

const RegisterPage = () => {
  const { registerMember }: MemberContextType = useContext(MemberContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    tag: '',
    password: '',
    confirmPassword: '',
    specialty: '' as Specialty | '',
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const avatars = Array.from(
    { length: 20 },
    (_, index) => `Avatar${index + 1}.png`,
  );

  const handleChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [input.name]: input.value }));
  };

  const handleSpecialtyChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      specialty: e.target.value as Specialty,
    }));
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');

    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!formData.specialty) {
      setError('Veuillez choisir une spécialité');
      return;
    }

    if (!selectedAvatar) {
      setError('Veuillez choisir une image de profil');
      return;
    }

    setLoading(true);

    try {
      await registerMember({
        email: formData.email,
        tag: formData.tag,
        password: formData.password,
        specialty: formData.specialty,
        profileImage: selectedAvatar,
      });
      navigate('/login');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'inscription",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
    setAvatarDialogOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        py: 2,
      }}
    >
      <Box
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 480,
          borderRadius: 2,
          background:
            'linear-gradient(180deg, rgba(10, 20, 40, 0.95) 0%, rgba(1, 10, 19, 0.95) 100%)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          boxShadow:
            '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(10, 200, 185, 0.03)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <GroupAddIcon sx={{ fontSize: 48, color: '#0ac8b9', mb: 1 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f0e6d2',
            }}
          >
            Inscription
          </Typography>
          <Typography variant="body2" sx={{ color: '#5b5a56', mt: 1 }}>
            Rejoins l&apos;arène des champions
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              bgcolor: 'rgba(200, 18, 74, 0.1)',
              border: '1px solid #c8124a',
              color: '#f0e6d2',
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="tag"
              name="tag"
              label="Tag (pseudo unique)"
              variant="outlined"
              value={formData.tag}
              onChange={handleChange}
              required
              placeholder="ProPlayer42"
            />
          </Box>

          <Box sx={{ marginBottom: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: '#c8aa6e',
                mb: 2,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              <Box sx={{ marginBottom: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel id="specialty-label">Spécialité</InputLabel>
                  <Select
                    labelId="specialty-label"
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    label="Spécialité"
                    onChange={handleSpecialtyChange}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1e3a5f',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#c8aa6e',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#0ac8b9',
                      },
                    }}
                  >
                    {SPECIALTIES.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {SPECIALTY_LABELS[spec]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ marginBottom: 2 }}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Mot de passe"
                  type="password"
                  variant="outlined"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </Box>
              <Box sx={{ marginBottom: 3 }}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  variant="outlined"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </Box>
              Image de profil *
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 2,
              }}
            >
              {selectedAvatar ? (
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    border: '3px solid #c8aa6e',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    boxShadow: '0 0 20px rgba(200, 170, 110, 0.5)',
                  }}
                >
                  <Box
                    component="img"
                    src={`/${selectedAvatar}`}
                    alt="Avatar selectionne"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: '#a09b8c' }}>
                  Aucun avatar selectionne
                </Typography>
              )}
            </Box>

            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={() => setAvatarDialogOpen(true)}
              sx={{
                mb: 1,
                borderColor: '#c8aa6e',
                color: '#f0e6d2',
                '&:hover': {
                  borderColor: '#f0e6d2',
                  backgroundColor: 'rgba(200, 170, 110, 0.08)',
                },
              }}
            >
              {selectedAvatar ? "Changer l'avatar" : 'Choisir un avatar'}
            </Button>

            <Dialog
              open={avatarDialogOpen}
              onClose={() => setAvatarDialogOpen(false)}
              fullWidth
              maxWidth="sm"
            >
              <DialogTitle>Choisir une image avatar</DialogTitle>
              <DialogContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                    py: 1,
                  }}
                >
                  {avatars.map((avatar, index) => (
                    <Box
                      key={avatar}
                      onClick={() => handleSelectAvatar(avatar)}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        border:
                          selectedAvatar === avatar
                            ? '3px solid #c8aa6e'
                            : '2px solid rgba(200, 170, 110, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        overflow: 'hidden',
                        backgroundColor: '#000',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          border: '3px solid #c8aa6e',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={`/${avatar}`}
                        alt={`Avatar ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </DialogContent>
            </Dialog>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#010a13' }} />
            ) : (
              'Rejoindre'
            )}
          </Button>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: '#a09b8c' }}
        >
          Déjà un compte ?{' '}
          <Link
            component={RouterLink}
            to="/login"
            underline="none"
            sx={{ color: '#0ac8b9' }}
          >
            Se connecter
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;
