import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  Box,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { getAllMembers } from '../../services/memberService';
import { PublicMemberProfile, SPECIALTY_LABELS } from '../../types';
import { useNavigate } from 'react-router-dom';

const MembersPage = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<PublicMemberProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    getAllMembers()
      .then(setMembers)
      .catch(() => {
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement des membres',
          severity: 'error',
        });
      });
  }, []);

  const filteredMembers = useMemo(() => {
    // Trier les membres par ordre alphabétique du tag
    const sortedMembers = [...members].sort((a, b) =>
      a.tag.toLowerCase().localeCompare(b.tag.toLowerCase()),
    );

    if (!searchQuery.trim()) {
      return sortedMembers;
    }
    const query = searchQuery.toLowerCase().trim();
    return sortedMembers.filter(
      (member) =>
        member.tag.toLowerCase().includes(query) ||
        (member.teamName && member.teamName.toLowerCase().includes(query)) ||
        SPECIALTY_LABELS[member.specialty].toLowerCase().includes(query),
    );
  }, [members, searchQuery]);

  const getProfileImageUrl = (imageName?: string) => {
    if (!imageName) return '/Avatar1.png';
    return `/${imageName}`;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        sx={{ color: '#c8aa6e', mb: 4, fontWeight: 'bold' }}
      >
        Membres Vinci Arena
      </Typography>

      <Alert
        severity="info"
        sx={{
          mb: 3,
          bgcolor: 'rgba(10, 200, 185, 0.08)',
          color: '#f0e6d2',
          border: '1px solid rgba(10, 200, 185, 0.3)',
        }}
      >
        Consultez tous les membres inscrits sur la plateforme. Utilisez la barre
        de recherche pour filtrer par tag, équipe ou spécialité.
      </Alert>

      {/* Barre de recherche */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par tag, équipe ou spécialité..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#c8aa6e' }} />
              </InputAdornment>
            ),
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
          {filteredMembers.length} membre
          {filteredMembers.length !== 1 ? 's' : ''} trouvé
          {filteredMembers.length !== 1 ? 's' : ''}
          {searchQuery && ` pour "${searchQuery}"`}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {filteredMembers.map((member) => (
          <Card
            key={member.id}
            onClick={() => navigate(`/members/${member.id}`)}
            sx={{
              bgcolor: 'rgba(1, 10, 19, 0.8)',
              border: '1px solid rgba(200, 170, 110, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: 'rgba(200, 170, 110, 0.6)',
                boxShadow: '0 4px 20px rgba(200, 170, 110, 0.15)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                }}
              >
                {/* Avatar */}
                <Avatar
                  src={getProfileImageUrl(member.profileImage)}
                  alt={member.tag}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '2px solid rgba(200, 170, 110, 0.5)',
                  }}
                >
                  <PersonIcon />
                </Avatar>

                {/* Info membre */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#f0e6d2',
                      fontWeight: 600,
                      mb: 0.5,
                    }}
                  >
                    {member.tag}
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Chip
                      label={SPECIALTY_LABELS[member.specialty]}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(10, 200, 185, 0.2)',
                        color: '#0ac8b9',
                        border: '1px solid #0ac8b9',
                        fontWeight: 600,
                      }}
                    />

                    {member.teamName && (
                      <Chip
                        label={`Équipe: ${member.teamName}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(200, 170, 110, 0.2)',
                          color: '#c8aa6e',
                          border: '1px solid rgba(200, 170, 110, 0.5)',
                        }}
                      />
                    )}

                    {member.role === 'ADMIN' && (
                      <Chip
                        label="👑 Admin"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(200, 170, 110, 0.3)',
                          color: '#fff6de',
                          border: '1px solid #c8aa6e',
                          fontWeight: 700,
                        }}
                      />
                    )}

                    {member.role === 'RESPONSIBLE' && (
                      <Chip
                        label="⭐ Responsable"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(200, 170, 110, 0.15)',
                          color: '#c8aa6e',
                          border: '1px solid rgba(200, 170, 110, 0.4)',
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {filteredMembers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography sx={{ color: '#a09b8c', fontSize: '1.1rem' }}>
            Aucun membre trouvé{searchQuery ? ` pour "${searchQuery}"` : ''}.
          </Typography>
        </Box>
      )}

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
    </Container>
  );
};

export default MembersPage;
