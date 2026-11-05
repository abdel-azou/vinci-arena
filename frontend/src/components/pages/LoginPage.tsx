import { useState, SyntheticEvent, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Link,
} from '@mui/material';
import { MemberContextType } from '../../types';
import { MemberContext } from '../../contexts/UserContext';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const LoginPage = () => {
  const { loginMember, authenticatedMember }: MemberContextType =
    useContext(MemberContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (authenticatedMember) {
      navigate('/');
    }
  }, [authenticatedMember, navigate]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginMember({ email, password }, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Box
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 420,
          borderRadius: 2,
          background:
            'linear-gradient(180deg, rgba(10, 20, 40, 0.95) 0%, rgba(1, 10, 19, 0.95) 100%)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          boxShadow:
            '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(10, 200, 185, 0.03)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LockOpenIcon sx={{ fontSize: 48, color: '#c8aa6e', mb: 1 }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f0e6d2',
            }}
          >
            Connexion
          </Typography>
          <Typography variant="body2" sx={{ color: '#5b5a56', mt: 1 }}>
            Entrez dans l&apos;arène
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Mot de passe"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Box>
          <Box sx={{ marginBottom: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#5b5a56',
                    '&.Mui-checked': { color: '#0ac8b9' },
                  }}
                />
              }
              label="Se souvenir de moi"
              sx={{ color: '#a09b8c' }}
            />
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
              'Entrer'
            )}
          </Button>
        </Box>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: '#a09b8c' }}
        >
          Pas encore de compte ?{' '}
          <Link
            component={RouterLink}
            to="/register"
            underline="none"
            sx={{ color: '#0ac8b9' }}
          >
            Rejoins l&apos;arène
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
