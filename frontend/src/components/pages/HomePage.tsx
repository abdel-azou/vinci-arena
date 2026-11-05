import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import {
  getTournaments,
  TournamentResponse,
} from '../../services/tournamentService';

type TournamentFilter = 'ALL' | 'ONGOING' | 'UPCOMING' | 'PAST';
type TournamentStatus = Exclude<TournamentFilter, 'ALL'>;

const getFilterLabel = (filter: TournamentStatus): string => {
  if (filter === 'ONGOING') {
    return 'En cours';
  }

  if (filter === 'UPCOMING') {
    return 'A venir';
  }

  return 'Passe';
};

const getTournamentFilter = (
  tournament: TournamentResponse,
): TournamentStatus => {
  const now = new Date();
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);

  if (endDate < now) {
    return 'PAST';
  }

  if (startDate > now) {
    return 'UPCOMING';
  }

  return 'ONGOING';
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString('fr-BE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

const overlapsSelectedDate = (tournament: TournamentResponse, date: string) => {
  const selectedDate = new Date(`${date}T12:00:00`);
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  return startDate <= selectedDate && endDate >= selectedDate;
};

const overlapsSelectedPeriod = (
  tournament: TournamentResponse,
  periodStart: string,
  periodEnd: string,
) => {
  const tournamentStart = new Date(tournament.startDate);
  const tournamentEnd = new Date(tournament.endDate);
  const fromDate = periodStart ? new Date(`${periodStart}T00:00:00`) : null;
  const toDate = periodEnd ? new Date(`${periodEnd}T23:59:59`) : null;

  if (fromDate && toDate) {
    return tournamentEnd >= fromDate && tournamentStart <= toDate;
  }

  if (fromDate) {
    return tournamentEnd >= fromDate;
  }

  if (toDate) {
    return tournamentStart <= toDate;
  }

  return true;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<TournamentResponse[]>([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<TournamentFilter>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [playerTagSearch, setPlayerTagSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => {
    const loadTournaments = async () => {
      setLoadingTournaments(true);
      setTournamentsError(null);

      try {
        const data = await getTournaments();
        setTournaments(data);
      } catch (error) {
        setTournamentsError(
          error instanceof Error
            ? error.message
            : 'Impossible de charger les tournois',
        );
      } finally {
        setLoadingTournaments(false);
      }
    };

    void loadTournaments();
  }, []);

  const teamOptions = useMemo(
    () =>
      Array.from(
        new Set(
          tournaments.flatMap((tournament) =>
            tournament.participantTeams.map((team) => team.teamName),
          ),
        ),
      ).sort((left, right) => left.localeCompare(right, 'fr')),
    [tournaments],
  );

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      if (
        selectedFilter !== 'ALL' &&
        getTournamentFilter(tournament) !== selectedFilter
      ) {
        return false;
      }

      if (appliedSearch.trim()) {
        const query = appliedSearch.trim().toLowerCase();
        if (!tournament.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (
        selectedTeamName &&
        !tournament.participantTeams.some(
          (team) => team.teamName === selectedTeamName,
        )
      ) {
        return false;
      }

      if (playerTagSearch.trim()) {
        const normalizedTag = playerTagSearch.trim().toLowerCase();
        const matchesPlayer = tournament.participantTeams.some((team) =>
          team.memberTags.some((tag) =>
            tag.toLowerCase().includes(normalizedTag),
          ),
        );
        if (!matchesPlayer) {
          return false;
        }
      }

      if (selectedDate && !overlapsSelectedDate(tournament, selectedDate)) {
        return false;
      }

      if (
        !selectedDate &&
        (periodStart || periodEnd) &&
        !overlapsSelectedPeriod(tournament, periodStart, periodEnd)
      ) {
        return false;
      }

      return true;
    });
  }, [
    tournaments,
    selectedFilter,
    appliedSearch,
    selectedTeamName,
    playerTagSearch,
    selectedDate,
    periodStart,
    periodEnd,
  ]);

  const filterButtons: { value: TournamentFilter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'ONGOING', label: 'En cours' },
    { value: 'UPCOMING', label: 'A venir' },
    { value: 'PAST', label: 'Passes' },
  ];

  const applySearch = () => {
    setAppliedSearch(searchInput.trim());
  };

  const clearAdvancedFilters = () => {
    setSelectedTeamName('');
    setPlayerTagSearch('');
    setSelectedDate('');
    setPeriodStart('');
    setPeriodEnd('');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 2,
          background:
            'linear-gradient(180deg, rgba(10, 20, 40, 0.9) 0%, rgba(1, 10, 19, 0.9) 100%)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: '0.05em',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #f0e6d2 0%, #c8aa6e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 3,
          }}
        >
          Tournois
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          {filterButtons.map((button) => (
            <Button
              key={button.value}
              variant={
                selectedFilter === button.value ? 'contained' : 'outlined'
              }
              onClick={() => setSelectedFilter(button.value)}
            >
              {button.label}
            </Button>
          ))}
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <TextField
            fullWidth
            label="Rechercher un tournoi"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applySearch();
              }
            }}
            sx={{
              '& .MuiInputLabel-root': { color: '#a09b8c' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#c8aa6e' },
              '& .MuiOutlinedInput-root': {
                color: '#f0e6d2',
                bgcolor: 'rgba(255, 255, 255, 0.03)',
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={applySearch}
            sx={{ minWidth: 170 }}
          >
            Rechercher
          </Button>
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterAltIcon />}
            onClick={() => setShowFilters((previous) => !previous)}
            sx={{ minWidth: 140 }}
          >
            Filtres
          </Button>
        </Stack>

        {showFilters && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(200, 170, 110, 0.2)',
            }}
          >
            <Stack spacing={2}>
              <TextField
                select
                fullWidth
                label="Nom d'une team participante"
                value={selectedTeamName}
                onChange={(event) => setSelectedTeamName(event.target.value)}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
              >
                <option value="">Toutes les teams</option>
                {teamOptions.map((teamName) => (
                  <option key={teamName} value={teamName}>
                    {teamName}
                  </option>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Rechercher un joueur par tag"
                value={playerTagSearch}
                onChange={(event) => setPlayerTagSearch(event.target.value)}
                helperText="Exemple : Lynx, Storm, Flash"
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date précise"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Si une date précise est choisie, la période est ignorée."
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Début de période"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={Boolean(selectedDate)}
                />
                <TextField
                  fullWidth
                  type="date"
                  label="Fin de période"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={Boolean(selectedDate)}
                />
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={clearAdvancedFilters}>Réinitialiser</Button>
              </Box>
            </Stack>
          </Box>
        )}

        {loadingTournaments && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {tournamentsError && !loadingTournaments && (
          <Alert severity="error">{tournamentsError}</Alert>
        )}

        {!loadingTournaments &&
          !tournamentsError &&
          filteredTournaments.length === 0 && (
            <Typography sx={{ color: '#a09b8c', textAlign: 'center' }}>
              Aucun tournoi dans cette categorie pour le moment.
            </Typography>
          )}

        {!loadingTournaments &&
          !tournamentsError &&
          filteredTournaments.length > 0 && (
            <Grid container spacing={3}>
              {filteredTournaments.map((tournament) => (
                <Grid item xs={12} sm={6} lg={4} key={tournament.id}>
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/tournaments/${tournament.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate(`/tournaments/${tournament.id}`);
                      }
                    }}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: '1px solid rgba(200, 170, 110, 0.35)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 'auto 0 0 0',
                        height: '34%',
                        background:
                          'linear-gradient(180deg, rgba(200, 170, 110, 0) 0%, rgba(200, 170, 110, 0.08) 55%, rgba(200, 170, 110, 0.2) 100%)',
                        pointerEvents: 'none',
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: 'rgba(200, 170, 110, 0.7)',
                      },
                      '&:focus-visible': {
                        outline: '2px solid #c8aa6e',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Stack
                      spacing={1.5}
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        height: '100%',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: '#f0e6d2', fontWeight: 700 }}
                      >
                        {tournament.name}
                      </Typography>

                      <Typography sx={{ color: '#d9d3c0' }}>
                        {tournament.description.length > 100
                          ? `${tournament.description.substring(0, 100)}...`
                          : tournament.description}
                      </Typography>

                      {tournament.winnerTeamName && (
                        <Typography sx={{ color: '#e0c889', fontWeight: 600 }}>
                          Gagnant: {tournament.winnerTeamName}
                        </Typography>
                      )}

                      <Box
                        sx={{
                          mt: 'auto',
                          pt: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          gap: 2,
                          borderTop: '1px solid rgba(200, 170, 110, 0.2)',
                        }}
                      >
                        <Stack spacing={0.75}>
                          <Typography sx={{ color: '#a09b8c' }}>
                            Debut: {formatDate(tournament.startDate)}
                          </Typography>
                          <Typography sx={{ color: '#a09b8c' }}>
                            Fin: {formatDate(tournament.endDate)}
                          </Typography>
                        </Stack>

                        <Chip
                          label={getFilterLabel(
                            getTournamentFilter(tournament),
                          )}
                          sx={{
                            bgcolor: 'rgba(200, 170, 110, 0.18)',
                            color: '#f0e6d2',
                            fontWeight: 700,
                            minWidth: 96,
                          }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
      </Box>
    </Container>
  );
};

export default HomePage;
