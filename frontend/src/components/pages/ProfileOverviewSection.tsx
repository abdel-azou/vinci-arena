import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AuthenticatedMember,
  PublicMemberTournament,
  SPECIALTY_LABELS,
  SPECIALTIES,
  Specialty,
} from '../../types';
import { getMemberTournamentMatches } from '../../services/memberService';
import { TournamentMatchResponse } from '../../services/tournamentService';

type Props = {
  authenticatedMember: AuthenticatedMember;
  editingSpecialty: boolean;
  newSpecialty: Specialty | '';
  onCancelEditSpecialty: () => void;
  onEditSpecialty: () => void;
  onSpecialtyChange: (event: SelectChangeEvent) => void;
  onUpdateSpecialty: () => void;
  specialtyErrorMessage: string;
  specialtyLoading: boolean;
  specialtySuccessMessage: string;
  teamName: string | null;
  tournaments: PublicMemberTournament[];
  mode?: 'overview' | 'tournaments';
};

const formatRoundLabel = (round: string) => round.replace(/_/g, ' ');

const ProfileOverviewSection = ({
  authenticatedMember,
  editingSpecialty,
  newSpecialty,
  onCancelEditSpecialty,
  onEditSpecialty,
  onSpecialtyChange,
  onUpdateSpecialty,
  specialtyErrorMessage,
  specialtyLoading,
  specialtySuccessMessage,
  teamName,
  tournaments,
  mode = 'overview',
}: Props) => {
  const navigate = useNavigate();
  const tournamentsPerPage = 3;
  const [page, setPage] = useState(0);
  const [expandedTournament, setExpandedTournament] = useState<number | null>(
    null,
  );
  const [matches, setMatches] = useState<
    Record<number, TournamentMatchResponse[]>
  >({});
  const [loadingMatches, setLoadingMatches] = useState<Record<number, boolean>>(
    {},
  );

  const totalPages = Math.max(
    1,
    Math.ceil(tournaments.length / tournamentsPerPage),
  );
  const safePage = Math.min(page, totalPages - 1);

  const visibleTournaments = useMemo(() => {
    const start = safePage * tournamentsPerPage;
    return tournaments.slice(start, start + tournamentsPerPage);
  }, [safePage, tournaments]);

  useEffect(() => {
    setPage(0);
    setExpandedTournament(null);
  }, [tournaments]);

  const handlePrevious = () => {
    setPage((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    setPage((current) => Math.min(totalPages - 1, current + 1));
  };

  const handleAccordionChange = async (tournamentId: number) => {
    if (expandedTournament === tournamentId) {
      setExpandedTournament(null);
      return;
    }

    setExpandedTournament(tournamentId);

    const memberId = authenticatedMember.id;
    if (!memberId) {
      return;
    }

    if (!matches[tournamentId] && !loadingMatches[tournamentId]) {
      setLoadingMatches((prev) => ({ ...prev, [tournamentId]: true }));
      try {
        const data = await getMemberTournamentMatches(memberId, tournamentId);
        setMatches((prev) => ({ ...prev, [tournamentId]: data }));
      } catch (error) {
        console.error('Erreur lors du chargement des matchs:', error);
        setMatches((prev) => ({ ...prev, [tournamentId]: [] }));
      } finally {
        setLoadingMatches((prev) => ({ ...prev, [tournamentId]: false }));
      }
    }
  };

  return (
    <Stack spacing={2.5}>
      {mode === 'overview' && (
        <>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: '#c8aa6e', letterSpacing: 1.2 }}
            >
              Vue generale
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(10, 200, 185, 0.05)',
                  borderColor: 'rgba(10, 200, 185, 0.2)',
                  height: '100%',
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: '#0ac8b9', letterSpacing: '0.15em' }}
                >
                  Tag
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: '#f0e6d2', fontWeight: 700 }}
                >
                  {authenticatedMember.tag}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(200, 170, 110, 0.05)',
                  borderColor: 'rgba(200, 170, 110, 0.2)',
                  height: '100%',
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ color: '#c8aa6e', letterSpacing: '0.15em' }}
                >
                  Equipe
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: '#f0e6d2', fontWeight: 700 }}
                >
                  {authenticatedMember.teamId
                    ? (teamName ?? 'Chargement...')
                    : 'Aucune equipe'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(10, 200, 185, 0.05)',
              border: '1px solid rgba(10, 200, 185, 0.2)',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: '#0ac8b9', letterSpacing: '0.15em' }}
            >
              Specialite
            </Typography>

            {!editingSpecialty ? (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={1.5}
                sx={{ mt: 1 }}
              >
                <Typography variant="h6" sx={{ color: '#f0e6d2' }}>
                  {SPECIALTY_LABELS[authenticatedMember.specialty]}
                </Typography>
                <Button
                  startIcon={<EditIcon />}
                  onClick={onEditSpecialty}
                  sx={{
                    color: '#0ac8b9',
                    '&:hover': {
                      bgcolor: 'rgba(10, 200, 185, 0.1)',
                    },
                  }}
                >
                  Modifier
                </Button>
              </Stack>
            ) : (
              <Box sx={{ mt: 2 }}>
                {specialtyErrorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {specialtyErrorMessage}
                  </Alert>
                )}
                {specialtySuccessMessage && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {specialtySuccessMessage}
                  </Alert>
                )}
                <FormControl fullWidth required sx={{ mb: 2 }}>
                  <InputLabel id="specialty-label">Spécialité</InputLabel>
                  <Select
                    labelId="specialty-label"
                    id="specialty"
                    name="specialty"
                    value={newSpecialty}
                    label="Spécialité"
                    onChange={onSpecialtyChange}
                  >
                    {SPECIALTIES.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {SPECIALTY_LABELS[spec]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    startIcon={<CheckIcon />}
                    onClick={onUpdateSpecialty}
                    disabled={specialtyLoading}
                    variant="contained"
                    sx={{
                      flex: 1,
                      bgcolor: '#0ac8b9',
                      '&:hover': { bgcolor: '#089c8f' },
                    }}
                  >
                    {specialtyLoading ? 'Mise a jour...' : 'Valider'}
                  </Button>
                  <Button
                    startIcon={<CloseIcon />}
                    onClick={onCancelEditSpecialty}
                    disabled={specialtyLoading}
                    variant="outlined"
                    sx={{
                      flex: 1,
                      color: '#a09b8c',
                      borderColor: '#a09b8c',
                    }}
                  >
                    Annuler
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </>
      )}

      {mode === 'tournaments' && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: 'rgba(200, 170, 110, 0.05)',
            border: '1px solid rgba(200, 170, 110, 0.2)',
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: '#c8aa6e', letterSpacing: '0.15em' }}
          >
            Mes tournois
          </Typography>

          {tournaments.length === 0 ? (
            <Typography sx={{ mt: 1.2, color: '#a09b8c' }}>
              Aucun tournoi trouve pour le moment.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 1.2 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.5 }}
              >
                <Typography sx={{ color: '#a09b8c', fontSize: '0.88rem' }}>
                  Page {safePage + 1} / {totalPages}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={handlePrevious}
                    disabled={safePage === 0}
                    sx={{
                      color: '#f0e6d2',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleNext}
                    disabled={safePage >= totalPages - 1}
                    sx={{
                      color: '#f0e6d2',
                      border: '1px solid rgba(255,255,255,0.2)',
                      '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' },
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              {visibleTournaments.map((tournament) => (
                <Accordion
                  key={tournament.id}
                  expanded={expandedTournament === tournament.id}
                  onChange={() => handleAccordionChange(tournament.id)}
                  disableGutters
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.14)',
                    bgcolor: 'rgba(255,255,255,0.04)',
                    '&:before': {
                      display: 'none',
                    },
                    '&.Mui-expanded': {
                      bgcolor: 'rgba(200, 170, 110, 0.08)',
                      margin: '0 0 8px 0',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: '#a09b8c' }} />}
                    sx={{
                      '&.Mui-expanded': {
                        minHeight: 48,
                      },
                      '& .MuiAccordionSummary-content.Mui-expanded': {
                        margin: '12px 0',
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ width: '100%', pr: 1, flexWrap: 'wrap' }}
                    >
                      <Box>
                        <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
                          {tournament.name}
                        </Typography>
                        <Typography
                          sx={{ color: '#a09b8c', fontSize: '0.88rem' }}
                        >
                          Statut: {tournament.status}
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionSummary>

                  <AccordionDetails sx={{ pt: 0, pb: 2, px: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mb: 1,
                      }}
                    >
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() =>
                          navigate(`/tournaments/${tournament.id}`)
                        }
                        sx={{
                          color: '#c8aa6e',
                          borderColor: 'rgba(200, 170, 110, 0.45)',
                          flexShrink: 0,
                        }}
                        variant="outlined"
                      >
                        Voir le tournoi
                      </Button>
                    </Box>

                    {loadingMatches[tournament.id] ? (
                      <Stack alignItems="center" sx={{ py: 2 }}>
                        <CircularProgress size={24} sx={{ color: '#0ac8b9' }} />
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
                        Aucun match trouve pour ce tournoi.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        <Typography
                          variant="overline"
                          sx={{ color: '#0ac8b9', fontSize: '0.7rem' }}
                        >
                          Tes matchs
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
                                : '(A determiner)'}
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.5,
                                color: '#a09b8c',
                                fontSize: '0.8rem',
                              }}
                            >
                              Manche: {formatRoundLabel(match.round)}
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
        </Box>
      )}
    </Stack>
  );
};

export default ProfileOverviewSection;
