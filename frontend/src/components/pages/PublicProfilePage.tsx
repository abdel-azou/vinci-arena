import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Pagination,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MemberContext } from '../../contexts/UserContext';
import {
  MemberContextType,
  PublicMemberProfile,
  PublicMemberTournament,
  SPECIALTY_LABELS,
} from '../../types';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  banMember,
  getPublicMemberProfile,
  getMemberTournamentMatches,
} from '../../services/memberService';
import { TournamentMatchResponse } from '../../services/tournamentService';

const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { authenticatedMember } = useContext<MemberContextType>(MemberContext);
  const navigate = useNavigate();

  const [member, setMember] = useState<PublicMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tournamentFilter, setTournamentFilter] = useState<
    'ALL' | 'UPCOMING' | 'PAST'
  >('ALL');
  const [tournamentPage, setTournamentPage] = useState(1);
  const tournamentsPerPage = 3;

  const [expandedTournament, setExpandedTournament] = useState<number | null>(
    null,
  );
  const [matches, setMatches] = useState<
    Record<number, TournamentMatchResponse[]>
  >({});
  const [loadingMatches, setLoadingMatches] = useState<Record<number, boolean>>(
    {},
  );

  const handleAccordionChange = async (tournamentId: number) => {
    if (expandedTournament === tournamentId) {
      setExpandedTournament(null);
    } else {
      setExpandedTournament(tournamentId);

      if (
        !matches[tournamentId] &&
        !loadingMatches[tournamentId] &&
        member?.id
      ) {
        setLoadingMatches((prev) => ({ ...prev, [tournamentId]: true }));
        try {
          const data = await getMemberTournamentMatches(
            member.id,
            tournamentId,
          );
          setMatches((prev) => ({ ...prev, [tournamentId]: data }));
        } catch (error) {
          console.error('Erreur lors du chargement des matchs:', error);
        } finally {
          setLoadingMatches((prev) => ({ ...prev, [tournamentId]: false }));
        }
      }
    }
  };

  const isAdmin = authenticatedMember?.role === 'ADMIN';
  const canBanMember =
    isAdmin &&
    authenticatedMember?.id !== undefined &&
    member !== null &&
    authenticatedMember.id !== member.id;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getTournamentStatusLabel = (
    status: PublicMemberTournament['status'],
  ) => {
    if (status === 'PREPARATION') return 'Brouillon';
    if (status === 'INSCRIPTION') return 'Inscription';
    if (status === 'EN_COURS') return 'En cours';
    return 'Termine';
  };

  const getTournamentStatusSx = (status: PublicMemberTournament['status']) => {
    if (status === 'INSCRIPTION') {
      return {
        bgcolor: 'rgba(200, 170, 110, 0.18)',
        color: '#fff6de',
        borderColor: 'rgba(200, 170, 110, 0.4)',
      };
    }
    if (status === 'EN_COURS') {
      return {
        bgcolor: 'rgba(10, 200, 185, 0.16)',
        color: '#defaf7',
        borderColor: 'rgba(10, 200, 185, 0.35)',
      };
    }
    if (status === 'PREPARATION') {
      return {
        bgcolor: 'rgba(255, 255, 255, 0.08)',
        color: '#d9d3c0',
        borderColor: 'rgba(255, 255, 255, 0.18)',
      };
    }

    return {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
      color: '#f0e6d2',
      borderColor: 'rgba(255, 255, 255, 0.18)',
    };
  };

  const getDayDifference = (targetDate: Date) => {
    const msInDay = 1000 * 60 * 60 * 24;
    return Math.ceil((targetDate.getTime() - Date.now()) / msInDay);
  };

  const getTournamentTimeHint = (tournament: PublicMemberTournament) => {
    const startDate = new Date(tournament.startDate);
    const endDate = new Date(tournament.endDate);

    if (endDate < new Date()) {
      const daysAgo = Math.abs(getDayDifference(endDate));
      return daysAgo <= 1
        ? 'Termine recemment'
        : `Termine il y a ${daysAgo} jours`;
    }

    if (startDate > new Date()) {
      const daysUntilStart = getDayDifference(startDate);
      return daysUntilStart <= 1
        ? 'Debute bientot'
        : `Commence dans ${daysUntilStart} jours`;
    }

    return 'En cours actuellement';
  };

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    if (
      authenticatedMember?.id !== undefined &&
      authenticatedMember.id === Number(id)
    ) {
      navigate('/profile');
      return;
    }

    const fetchMember = async () => {
      try {
        setLoading(true);
        const data = await getPublicMemberProfile(
          Number(id),
          authenticatedMember?.token,
        );
        setMember(data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Erreur lors du chargement du profil',
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchMember();
  }, [authenticatedMember, id, navigate]);

  const handleBanMember = async () => {
    if (!authenticatedMember || !id) return;

    try {
      setDeleteLoading(true);
      await banMember(Number(id));
      navigate('/gestion');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Erreur lors du bannissement',
      );
      setConfirmDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const tournaments = member?.tournaments ?? [];
  const now = new Date();
  const upcomingTournaments = tournaments
    .filter(
      (tournament) =>
        tournament.status !== 'TERMINE' && new Date(tournament.endDate) >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

  const pastTournaments = tournaments
    .filter(
      (tournament) =>
        tournament.status === 'TERMINE' || new Date(tournament.endDate) < now,
    )
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
    );

  const filteredTournaments =
    tournamentFilter === 'UPCOMING'
      ? upcomingTournaments
      : tournamentFilter === 'PAST'
        ? pastTournaments
        : [...upcomingTournaments, ...pastTournaments];

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTournaments.length / tournamentsPerPage),
  );
  const clampedPage = Math.min(tournamentPage, totalPages);
  const currentPageStartIndex = (clampedPage - 1) * tournamentsPerPage;
  const visibleTournaments = filteredTournaments.slice(
    currentPageStartIndex,
    currentPageStartIndex + tournamentsPerPage,
  );

  useEffect(() => {
    setTournamentPage(1);
  }, [tournamentFilter]);

  useEffect(() => {
    if (tournamentPage > totalPages) {
      setTournamentPage(totalPages);
    }
  }, [tournamentPage, totalPages]);

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#c8aa6e' }} />
      </Container>
    );
  }

  if (errorMessage || !member) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#f0e6d2' }}>
            {errorMessage || 'Membre introuvable'}
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2, color: '#a09b8c' }}
          >
            Retour
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          background:
            'linear-gradient(180deg, rgba(10, 20, 40, 0.95) 0%, rgba(1, 10, 19, 0.95) 100%)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          boxShadow:
            '0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 60px rgba(10, 200, 185, 0.03)',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          {member.profileImage ? (
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: '3px solid #c8aa6e',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                mb: 1,
                boxShadow: '0 0 20px rgba(200, 170, 110, 0.5)',
              }}
            >
              <Box
                component="img"
                src={`/${member.profileImage}`}
                alt="Profile"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          ) : (
            <PersonIcon sx={{ fontSize: 48, color: '#c8aa6e', mb: 1 }} />
          )}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f0e6d2',
            }}
          >
            {member.tag}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'minmax(280px, 0.9fr) 1.1fr',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'rgba(10, 200, 185, 0.05)',
                border: '1px solid rgba(10, 200, 185, 0.3)',
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: '#0ac8b9', letterSpacing: '0.15em' }}
              >
                Tag
              </Typography>
              <Typography variant="h6" sx={{ color: '#f0e6d2' }}>
                {member.tag}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'rgba(200, 170, 110, 0.05)',
                border: '1px solid rgba(200, 170, 110, 0.3)',
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: '#c8aa6e', letterSpacing: '0.15em' }}
              >
                Équipe
              </Typography>
              <Typography variant="h6" sx={{ color: '#f0e6d2' }}>
                {member.teamName ?? 'Aucune équipe'}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'rgba(10, 200, 185, 0.05)',
                border: '1px solid rgba(10, 200, 185, 0.3)',
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: '#0ac8b9', letterSpacing: '0.15em' }}
              >
                Spécialité
              </Typography>
              <Typography variant="h6" sx={{ color: '#f0e6d2' }}>
                {SPECIALTY_LABELS[member.specialty]}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'rgba(200, 170, 110, 0.05)',
                border: '1px solid rgba(200, 170, 110, 0.3)',
              }}
            >
              <Typography
                variant="overline"
                sx={{ color: '#c8aa6e', letterSpacing: '0.15em' }}
              >
                Date de création
              </Typography>
              <Typography variant="h6" sx={{ color: '#f0e6d2' }}>
                {formatDate(member.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'rgba(10, 200, 185, 0.05)',
              border: '1px solid rgba(10, 200, 185, 0.3)',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                variant="overline"
                sx={{ color: '#0ac8b9', letterSpacing: '0.15em' }}
              >
                Parcours en tournoi
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`${tournaments.length} total`}
                  sx={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    color: '#f0e6d2',
                  }}
                />
                <Chip
                  size="small"
                  label={`${upcomingTournaments.length} a venir`}
                  sx={{
                    border: '1px solid rgba(10, 200, 185, 0.35)',
                    bgcolor: 'rgba(10, 200, 185, 0.14)',
                    color: '#defaf7',
                  }}
                />
                <Chip
                  size="small"
                  label={`${pastTournaments.length} passes`}
                  sx={{
                    border: '1px solid rgba(200, 170, 110, 0.35)',
                    bgcolor: 'rgba(200, 170, 110, 0.14)',
                    color: '#fff6de',
                  }}
                />
              </Stack>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, mb: 1 }}
              flexWrap="wrap"
            >
              <Button
                size="small"
                variant={tournamentFilter === 'ALL' ? 'contained' : 'outlined'}
                onClick={() => setTournamentFilter('ALL')}
                sx={{
                  borderColor: 'rgba(255,255,255,0.25)',
                  color: tournamentFilter === 'ALL' ? '#0a141f' : '#f0e6d2',
                  bgcolor:
                    tournamentFilter === 'ALL' ? '#c8aa6e' : 'transparent',
                  '&:hover': {
                    bgcolor:
                      tournamentFilter === 'ALL'
                        ? '#d9bc83'
                        : 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.35)',
                  },
                }}
              >
                Tous
              </Button>
              <Button
                size="small"
                variant={
                  tournamentFilter === 'UPCOMING' ? 'contained' : 'outlined'
                }
                onClick={() => setTournamentFilter('UPCOMING')}
                sx={{
                  borderColor: 'rgba(10, 200, 185, 0.35)',
                  color:
                    tournamentFilter === 'UPCOMING' ? '#0a141f' : '#defaf7',
                  bgcolor:
                    tournamentFilter === 'UPCOMING' ? '#0ac8b9' : 'transparent',
                  '&:hover': {
                    bgcolor:
                      tournamentFilter === 'UPCOMING'
                        ? '#14d8ca'
                        : 'rgba(10, 200, 185, 0.12)',
                    borderColor: 'rgba(10, 200, 185, 0.5)',
                  },
                }}
              >
                A venir / En cours
              </Button>
              <Button
                size="small"
                variant={tournamentFilter === 'PAST' ? 'contained' : 'outlined'}
                onClick={() => setTournamentFilter('PAST')}
                sx={{
                  borderColor: 'rgba(200, 170, 110, 0.4)',
                  color: tournamentFilter === 'PAST' ? '#0a141f' : '#fff6de',
                  bgcolor:
                    tournamentFilter === 'PAST' ? '#c8aa6e' : 'transparent',
                  '&:hover': {
                    bgcolor:
                      tournamentFilter === 'PAST'
                        ? '#d9bc83'
                        : 'rgba(200, 170, 110, 0.12)',
                    borderColor: 'rgba(200, 170, 110, 0.55)',
                  },
                }}
              >
                Passes
              </Button>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.2}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ mb: 1 }}
            >
              <Typography sx={{ color: '#a09b8c', fontSize: '0.88rem' }}>
                {filteredTournaments.length === 0
                  ? 'Aucun tournoi a afficher'
                  : `${currentPageStartIndex + 1}-${Math.min(
                      currentPageStartIndex + tournamentsPerPage,
                      filteredTournaments.length,
                    )} sur ${filteredTournaments.length}`}
              </Typography>
            </Stack>

            {visibleTournaments.length === 0 ? (
              <Typography sx={{ mt: 1, color: '#a09b8c' }}>
                Aucun tournoi pour ce filtre.
              </Typography>
            ) : (
              <Stack spacing={1.25} sx={{ mt: 1 }}>
                {visibleTournaments.map((tournament) => (
                  <Accordion
                    key={tournament.id}
                    expanded={expandedTournament === tournament.id}
                    onChange={() => handleAccordionChange(tournament.id)}
                    disableGutters
                    sx={{
                      borderRadius: 1,
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      bgcolor: 'rgba(1, 10, 19, 0.58)',
                      transition:
                        'transform 0.18s ease, border-color 0.18s ease',
                      '&:hover': {
                        borderColor: 'rgba(200, 170, 110, 0.45)',
                      },
                      '&:before': {
                        display: 'none',
                      },
                      '&.Mui-expanded': {
                        margin: '0 0 8px 0',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: '#a09b8c' }} />}
                      sx={{
                        '&.Mui-expanded': { minHeight: 48 },
                        '& .MuiAccordionSummary-content.Mui-expanded': {
                          margin: '12px 0',
                        },
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={1}
                        sx={{ width: '100%', pr: 2 }}
                      >
                        <Box>
                          <Typography
                            sx={{ color: '#f0e6d2', fontWeight: 700 }}
                          >
                            {tournament.name}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.35,
                              color: '#a09b8c',
                              fontSize: '0.9rem',
                            }}
                          >
                            {formatShortDate(tournament.startDate)} {' - '}
                            {formatShortDate(tournament.endDate)}
                          </Typography>
                          <Typography
                            sx={{
                              mt: 0.35,
                              color: '#0ac8b9',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                            }}
                          >
                            {getTournamentTimeHint(tournament)}
                          </Typography>
                        </Box>

                        <Stack
                          direction={{ xs: 'row', sm: 'column' }}
                          alignItems={{ xs: 'center', sm: 'flex-end' }}
                          spacing={1}
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          <Chip
                            size="small"
                            label={getTournamentStatusLabel(tournament.status)}
                            sx={{
                              border: '1px solid',
                              ...getTournamentStatusSx(tournament.status),
                            }}
                          />
                          <Button
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tournaments/${tournament.id}`);
                            }}
                            sx={{
                              color: '#c8aa6e',
                              borderColor: 'rgba(200, 170, 110, 0.45)',
                              alignSelf: { xs: 'flex-start', sm: 'auto' },
                            }}
                            variant="outlined"
                          >
                            Voir le tournoi
                          </Button>
                        </Stack>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                      {loadingMatches[tournament.id] ? (
                        <Stack alignItems="center" sx={{ py: 2 }}>
                          <CircularProgress
                            size={24}
                            sx={{ color: '#0ac8b9' }}
                          />
                        </Stack>
                      ) : matches[tournament.id]?.length === 0 ? (
                        <Typography
                          sx={{
                            color: '#a09b8c',
                            fontSize: '0.88rem',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            py: 1,
                          }}
                        >
                          Aucun match trouvé pour ce tournoi.
                        </Typography>
                      ) : (
                        <Stack spacing={1}>
                          <Typography
                            variant="overline"
                            sx={{ color: '#0ac8b9', fontSize: '0.7rem' }}
                          >
                            Matchs du joueur
                          </Typography>
                          {matches[tournament.id]?.map((match) => (
                            <Box
                              key={match.id}
                              sx={{
                                p: 1.5,
                                borderRadius: 1,
                                bgcolor: 'rgba(10, 200, 185, 0.05)',
                                border: '1px solid rgba(10, 200, 185, 0.15)',
                              }}
                            >
                              <Typography
                                sx={{
                                  color: '#f0e6d2',
                                  fontSize: '0.90rem',
                                  fontWeight: 600,
                                }}
                              >
                                {match.teamAName}{' '}
                                {match.teamBName
                                  ? `vs ${match.teamBName}`
                                  : '(À déterminer)'}
                              </Typography>
                              <Typography
                                sx={{
                                  mt: 0.5,
                                  color: '#a09b8c',
                                  fontSize: '0.8rem',
                                }}
                              >
                                Manche: {match.round.replace(/_/g, ' ')}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}

            {filteredTournaments.length > tournamentsPerPage && (
              <Stack alignItems="center" sx={{ mt: 2 }}>
                <Pagination
                  page={clampedPage}
                  count={totalPages}
                  onChange={(_, page) => setTournamentPage(page)}
                  showFirstButton
                  showLastButton
                  siblingCount={0}
                  boundaryCount={1}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#f0e6d2',
                      borderColor: 'rgba(255,255,255,0.22)',
                    },
                    '& .Mui-selected': {
                      bgcolor: '#c8aa6e !important',
                      color: '#0a141f',
                    },
                  }}
                />
              </Stack>
            )}
          </Box>
        </Box>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          fullWidth
          sx={{ mt: 3, color: '#a09b8c' }}
        >
          Retour
        </Button>

        {/* Bouton bannissement — visible uniquement pour les admins */}
        {canBanMember && (
          <Button
            startIcon={<DeleteForeverIcon />}
            onClick={() => setConfirmDeleteOpen(true)}
            fullWidth
            variant="outlined"
            color="error"
            sx={{
              mt: 1,
              borderColor: 'rgba(211, 47, 47, 0.5)',
              color: '#f44336',
              '&:hover': {
                bgcolor: 'rgba(211, 47, 47, 0.08)',
                borderColor: '#f44336',
              },
            }}
          >
            Bannir ce membre
          </Button>
        )}
      </Box>

      {/* Dialog de confirmation */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle sx={{ color: '#f0e6d2' }}>
          Confirmer le bannissement
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir bannir <strong>{member.tag}</strong> ? Ce
            membre ne pourra plus se connecter, son profil sera masqué et il ne
            pourra pas créer de nouveau compte avec la même adresse email. Ses
            données sont conservées pour l'historique des équipes et tournois.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            disabled={deleteLoading}
            sx={{ color: '#a09b8c' }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => void handleBanMember()}
            disabled={deleteLoading}
            variant="contained"
            color="error"
          >
            {deleteLoading ? 'Bannissement...' : 'Confirmer le bannissement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublicProfilePage;
