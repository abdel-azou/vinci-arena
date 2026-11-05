import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveAlt1Icon from '@mui/icons-material/PersonRemoveAlt1';
import { MemberContext } from '../../contexts/UserContext';
import { AdminSummary, MemberContextType } from '../../types';

const AdminPage = () => {
  const {
    authenticatedMember,
    getAdmins,
    promoteMemberToAdmin,
    removeMemberAdminRole,
    searchMembers,
  } = useContext<MemberContextType>(MemberContext);
  const navigate = useNavigate();

  const [admins, setAdmins] = useState<AdminSummary[]>([]);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AdminSummary[]>([]);
  const [targetEmail, setTargetEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getAdmins();
      setAdmins(list);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du chargement des admins';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [getAdmins]);

  useEffect(() => {
    if (!authenticatedMember) {
      navigate('/login');
      return;
    }

    if (authenticatedMember.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    loadAdmins();
  }, [authenticatedMember, loadAdmins, navigate]);

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return admins;
    }

    return admins.filter(
      (admin) =>
        admin.tag.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query),
    );
  }, [admins, search]);

  const handleCreateAdmin = async () => {
    const email = targetEmail.trim();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email) {
      setErrorMessage("L'email du membre est obligatoire");
      return;
    }

    try {
      setCreating(true);
      const response = await promoteMemberToAdmin(email);
      setSuccessMessage(`${response.message} (rôle final: ${response.role})`);
      setTargetEmail('');
      setSearchQuery('');
      setSearchResults([]);
      await loadAdmins();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ajout de l'admin";
      setErrorMessage(message);
    } finally {
      setCreating(false);
    }
  };

  const handleSelectMember = (email: string) => {
    setTargetEmail(email);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchQueryChange = async (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchMembers(value);
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (email === authenticatedMember?.email) {
      setErrorMessage('Tu ne peux pas retirer ton propre statut admin');
      return;
    }

    try {
      setRemovingEmail(email);
      const response = await removeMemberAdminRole(email);
      setSuccessMessage(`${response.message} (rôle final: ${response.role})`);
      await loadAdmins();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du retrait du statut admin';
      setErrorMessage(message);
    } finally {
      setRemovingEmail(null);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          mt: 2,
          p: 3,
          borderRadius: 2,
          bgcolor: 'rgba(7, 10, 18, 0.92)',
          border: '1px solid rgba(200, 170, 110, 0.45)',
          boxShadow:
            '0 0 0 1px rgba(200, 170, 110, 0.08), 0 12px 28px rgba(0, 0, 0, 0.35)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <AdminPanelSettingsIcon sx={{ color: '#c8aa6e' }} />
          <Typography variant="h5" sx={{ color: '#f0e6d2', fontWeight: 700 }}>
            Gestion des admins
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: '#a09b8c', mb: 3 }}>
          Ajoute ou retire le statut admin avec l&apos;email du membre.
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap',
            mb: 3,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <TextField
              label={
                targetEmail ? 'Email selectionné' : 'Email ou tag du membre'
              }
              type="email"
              size="small"
              value={searchQuery || targetEmail}
              onChange={(e) => handleSearchQueryChange(e.target.value)}
              fullWidth
              placeholder="Recherche par email ou tag..."
              sx={{
                '& .MuiInputLabel-root': { color: '#c8aa6e' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#0ac8b9' },
                '& .MuiOutlinedInput-root': {
                  color: '#f0e6d2',
                  bgcolor: 'rgba(10, 20, 40, 0.75)',
                  '& fieldset': { borderColor: 'rgba(200, 170, 110, 0.45)' },
                  '&:hover fieldset': { borderColor: '#c8aa6e' },
                  '&.Mui-focused fieldset': { borderColor: '#0ac8b9' },
                },
              }}
            />
            {searchResults.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  bgcolor: 'rgba(10, 20, 40, 0.95)',
                  border: '1px solid rgba(200, 170, 110, 0.45)',
                  borderRadius: 1,
                  zIndex: 10,
                  maxHeight: 200,
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((result) => (
                  <Button
                    key={result.email}
                    fullWidth
                    onClick={() => handleSelectMember(result.email)}
                    sx={{
                      display: 'block',
                      textAlign: 'left',
                      p: 1.5,
                      color: '#f0e6d2',
                      borderBottom: '1px solid rgba(200, 170, 110, 0.2)',
                      '&:hover': {
                        bgcolor: 'rgba(200, 170, 110, 0.1)',
                      },
                    }}
                  >
                    <Box sx={{ fontWeight: 600 }}>{result.tag}</Box>
                    <Box sx={{ fontSize: '0.875rem', color: '#a09b8c' }}>
                      {result.email}
                    </Box>
                  </Button>
                ))}
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
            onClick={handleCreateAdmin}
            disabled={creating || !targetEmail}
            sx={{
              bgcolor: '#c8aa6e',
              color: '#10141f',
              fontWeight: 700,
              '&:hover': { bgcolor: '#e0c889' },
            }}
          >
            {creating ? 'Ajout...' : 'Nommer admin'}
          </Button>
          {targetEmail && (
            <Button
              variant="outlined"
              onClick={() => {
                setTargetEmail('');
                setSearchQuery('');
                setSearchResults([]);
              }}
              sx={{
                color: '#a09b8c',
                borderColor: '#a09b8c',
                '&:hover': {
                  borderColor: '#c8aa6e',
                  bgcolor: 'rgba(200, 170, 110, 0.1)',
                },
              }}
            >
              Annuler
            </Button>
          )}
        </Box>

        <TextField
          label="Rechercher un admin"
          type="search"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{
            mb: 2,
            '& .MuiInputLabel-root': { color: '#a09b8c' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#c8aa6e' },
            '& .MuiOutlinedInput-root': {
              color: '#f0e6d2',
              bgcolor: 'rgba(10, 20, 40, 0.45)',
              '& fieldset': { borderColor: 'rgba(160, 155, 140, 0.45)' },
              '&:hover fieldset': { borderColor: '#c8aa6e' },
              '&.Mui-focused fieldset': { borderColor: '#c8aa6e' },
            },
          }}
        />

        {loading ? (
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} sx={{ color: '#c8aa6e' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filteredAdmins.length === 0 && (
              <Typography sx={{ color: '#a09b8c' }}>
                Aucun admin trouvé.
              </Typography>
            )}

            {filteredAdmins.map((admin) => {
              const isSelf = admin.email === authenticatedMember?.email;
              const isRemoving = removingEmail === admin.email;

              return (
                <Box
                  key={admin.email}
                  onClick={() => navigate(`/members/${admin.id}`)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                    p: 1.25,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(200, 170, 110, 0.2)',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(200, 170, 110, 0.08)',
                      border: '1px solid rgba(200, 170, 110, 0.4)',
                    },
                  }}
                >
                  <Box>
                    <Typography sx={{ color: '#f0e6d2', fontWeight: 600 }}>
                      {admin.tag}
                      {isSelf && (
                        <Typography
                          component="span"
                          sx={{ ml: 1, color: '#c8aa6e', fontSize: '0.8rem' }}
                        >
                          (vous)
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a09b8c' }}>
                      {admin.email}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<PersonRemoveAlt1Icon />}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleRemoveAdmin(admin.email);
                    }}
                    disabled={isSelf || isRemoving}
                    sx={{
                      minWidth: 150,
                      bgcolor: '#8f1f2d',
                      border: '1px solid rgba(242, 128, 128, 0.5)',
                      '&:hover': { bgcolor: '#b22637' },
                    }}
                  >
                    {isRemoving ? 'Retrait...' : 'Retirer admin'}
                  </Button>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default AdminPage;
