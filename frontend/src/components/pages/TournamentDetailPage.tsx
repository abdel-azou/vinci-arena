import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  declareMatchForfeit,
  getTournamentById,
  generateTournamentMatches,
  registerMyTeamToTournament,
  getTournamentMatches,
  publishTournamentPlanning,
  respondToMatchResult,
  updateMatchSelection,
  updateMatchResult,
  updateTournamentMatch,
  RespondToMatchResultPayload,
  UpdateMatchSelectionPayload,
  UpdateMatchResultPayload,
  TournamentResponse,
  TournamentMatchResponse,
  UpdateTournamentMatchPayload,
} from '../../services/tournamentService';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';
import TournamentDetailNavigation from './TournamentDetailNavigation';
import TournamentOverviewSection from './TournamentOverviewSection';
import TournamentPlanningSection from './TournamentPlanningSection';
import TournamentParticipantsSection from './TournamentParticipantsSection';
import {
  DetailSection,
  hasRegistrationDeadlinePassed,
  isRegistrationOpen,
} from './TournamentDetailPage.utils';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { authenticatedMember } = useContext<MemberContextType>(MemberContext);

  const [tournament, setTournament] = useState<TournamentResponse | null>(null);
  const [loadingTournament, setLoadingTournament] = useState(true);
  const [tournamentError, setTournamentError] = useState<string | null>(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null,
  );
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(
    null,
  );
  const [planningLoading, setPlanningLoading] = useState(false);
  const [planningError, setPlanningError] = useState<string | null>(null);
  const [planningSuccess, setPlanningSuccess] = useState<string | null>(null);
  const [matches, setMatches] = useState<TournamentMatchResponse[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const initialSection = searchParams.get('section');
  const [activeSection, setActiveSection] = useState<DetailSection>(
    initialSection === 'overview' ||
      initialSection === 'participants' ||
      initialSection === 'planning'
      ? initialSection
      : 'overview',
  );

  const loadTournament = useCallback(async () => {
    const tournamentId = Number(id);

    if (!Number.isInteger(tournamentId) || tournamentId <= 0) {
      setTournamentError('Identifiant de tournoi invalide');
      setLoadingTournament(false);
      return;
    }

    setLoadingTournament(true);
    setTournamentError(null);

    try {
      const data = await getTournamentById(tournamentId);
      setTournament(data);
    } catch (error) {
      setTournamentError(
        error instanceof Error
          ? error.message
          : 'Impossible de charger ce tournoi',
      );
    } finally {
      setLoadingTournament(false);
    }
  }, [id]);

  useEffect(() => {
    void loadTournament();
  }, [loadTournament]);

  const canRegisterMyTeam =
    !!authenticatedMember?.teamId &&
    (authenticatedMember.role === 'RESPONSIBLE' ||
      authenticatedMember.role === 'ADMIN');

  const tournamentIsJoinable =
    !!tournament &&
    isRegistrationOpen(tournament) &&
    tournament.registeredTeamsCount < tournament.maxTeams;

  const canGeneratePlanning =
    !!tournament &&
    tournament.status !== 'PREPARATION' &&
    tournament.status !== 'TERMINE' &&
    hasRegistrationDeadlinePassed(tournament);

  const isAdmin = authenticatedMember?.role === 'ADMIN';

  const loadMatches = useCallback(async () => {
    if (!tournament) {
      return;
    }

    setMatchesLoading(true);
    setMatchesError(null);
    try {
      const data = await getTournamentMatches(tournament.id);
      setMatches(data);
    } catch (error) {
      setMatchesError(
        error instanceof Error
          ? error.message
          : 'Impossible de charger le planning',
      );
    } finally {
      setMatchesLoading(false);
    }
  }, [tournament]);

  useEffect(() => {
    if (activeSection === 'planning') {
      void loadMatches();
    }
  }, [activeSection, loadMatches]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (
      section === 'overview' ||
      section === 'participants' ||
      section === 'planning'
    ) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const matchIdFromQuery = Number(searchParams.get('matchId'));
  const selectedMatchIdFromQuery = Number.isInteger(matchIdFromQuery)
    ? matchIdFromQuery
    : null;

  const handleSelectSection = (section: DetailSection) => {
    setActiveSection(section);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('section', section);
    if (section !== 'planning') {
      nextParams.delete('matchId');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSelectMatch = (matchId: number | null) => {
    const currentSection = searchParams.get('section');
    const currentMatchId = searchParams.get('matchId');
    const nextMatchId = matchId == null ? null : String(matchId);

    if (currentSection === 'planning' && currentMatchId === nextMatchId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('section', 'planning');
    if (matchId == null) {
      nextParams.delete('matchId');
    } else {
      nextParams.set('matchId', String(matchId));
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleRegisterMyTeam = async () => {
    if (!tournament) {
      return;
    }

    try {
      setRegistrationLoading(true);
      setRegistrationError(null);
      setRegistrationSuccess(null);

      const response = await registerMyTeamToTournament(tournament.id);
      setRegistrationSuccess(response.message);
      await loadTournament();
    } catch (error) {
      setRegistrationError(
        error instanceof Error
          ? error.message
          : "Impossible d'inscrire la team à ce tournoi",
      );
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleGeneratePlanning = async () => {
    if (!tournament) {
      return;
    }

    try {
      setPlanningLoading(true);
      setPlanningError(null);
      setPlanningSuccess(null);

      const matches = await generateTournamentMatches(tournament.id);
      setPlanningSuccess(
        matches.length === 0
          ? 'Tournoi termine : gagnant declare'
          : `Planning genere (${matches.length} match${
              matches.length > 1 ? 's' : ''
            })`,
      );
      await loadTournament();
      await loadMatches();
    } catch (error) {
      setPlanningError(
        error instanceof Error
          ? error.message
          : 'Impossible de generer le planning',
      );
    } finally {
      setPlanningLoading(false);
    }
  };

  const handleUpdateMatch = async (
    matchId: number,
    payload: UpdateTournamentMatchPayload,
  ) => {
    if (!tournament) {
      return;
    }
    const updated = await updateTournamentMatch(
      tournament.id,
      matchId,
      payload,
    );
    setMatches((prev) =>
      prev.map((match) => (match.id === updated.id ? updated : match)),
    );
  };

  const handleUpdateMatchSelection = async (
    matchId: number,
    payload: UpdateMatchSelectionPayload,
  ) => {
    if (!tournament) {
      return;
    }

    const updated = await updateMatchSelection(tournament.id, matchId, payload);
    setMatches((prev) =>
      prev.map((match) => (match.id === updated.id ? updated : match)),
    );
  };

  const handleUpdateMatchResult = async (
    matchId: number,
    payload: UpdateMatchResultPayload,
  ) => {
    if (!tournament) {
      return;
    }

    const updated = await updateMatchResult(tournament.id, matchId, payload);
    setMatches((prev) =>
      prev.map((match) => (match.id === updated.id ? updated : match)),
    );
  };

  const handleRespondToMatchResult = async (
    matchId: number,
    payload: RespondToMatchResultPayload,
  ) => {
    if (!tournament) {
      return;
    }

    const updated = await respondToMatchResult(tournament.id, matchId, payload);
    setMatches((prev) =>
      prev.map((match) => (match.id === updated.id ? updated : match)),
    );
  };

  const handleDeclareMatchForfeit = async (matchId: number) => {
    if (!tournament) {
      return;
    }

    const updated = await declareMatchForfeit(tournament.id, matchId);
    setMatches((prev) =>
      prev.map((match) => (match.id === updated.id ? updated : match)),
    );
  };

  const handlePublishPlanning = async () => {
    if (!tournament) {
      return;
    }

    if (matches.length === 0) {
      setPublishError("Aucun match à publier. Génère d'abord le planning.");
      setPublishSuccess(null);
      return;
    }

    const missingSchedule = matches.some((match) => !match.scheduledDate);
    if (missingSchedule) {
      setPublishError(
        'Ajoute une date pour chaque match avant de publier le planning.',
      );
      setPublishSuccess(null);
      return;
    }

    try {
      setPublishLoading(true);
      setPublishError(null);
      setPublishSuccess(null);

      const response = await publishTournamentPlanning(tournament.id);
      setPublishSuccess(response.message);
      await loadMatches();
    } catch (error) {
      setPublishError(
        error instanceof Error
          ? error.message
          : 'Impossible de publier le planning',
      );
    } finally {
      setPublishLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: 800,
          letterSpacing: 1,
          color: '#f0e6d2',
        }}
      >
        Details d&apos;un tournoi
      </Typography>

      <Box
        sx={{
          position: 'relative',
          px: { xs: 0, md: 1 },
          py: 1,
        }}
      >
        {loadingTournament && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {tournamentError && !loadingTournament && (
          <Stack spacing={2}>
            <Alert severity="error">{tournamentError}</Alert>
            <Box>
              <Button variant="outlined" onClick={() => navigate('/')}>
                Retour a l&apos;accueil
              </Button>
            </Box>
          </Stack>
        )}

        {!loadingTournament && !tournamentError && tournament && (
          <Stack spacing={3.5}>
            {registrationError && (
              <Alert severity="error">{registrationError}</Alert>
            )}

            {registrationSuccess && (
              <Alert severity="success">{registrationSuccess}</Alert>
            )}

            {planningError && <Alert severity="error">{planningError}</Alert>}

            {planningSuccess && (
              <Alert severity="success">{planningSuccess}</Alert>
            )}

            {publishError && <Alert severity="error">{publishError}</Alert>}

            {publishSuccess && (
              <Alert severity="success">{publishSuccess}</Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <TournamentDetailNavigation
                  activeSection={activeSection}
                  onSelectSection={handleSelectSection}
                />
              </Grid>

              <Grid item xs={12} md={9}>
                <Stack spacing={3} sx={{ height: 'auto' }}>
                  {activeSection === 'overview' && (
                    <TournamentOverviewSection
                      onBackHome={() => navigate('/')}
                      onRegisterMyTeam={handleRegisterMyTeam}
                      registrationLoading={registrationLoading}
                      canRegisterMyTeam={canRegisterMyTeam}
                      tournamentIsJoinable={tournamentIsJoinable}
                      tournament={tournament}
                    />
                  )}

                  {activeSection === 'participants' && (
                    <TournamentParticipantsSection tournament={tournament} />
                  )}

                  {activeSection === 'planning' && (
                    <TournamentPlanningSection
                      isAdmin={!!isAdmin}
                      canGeneratePlanning={canGeneratePlanning}
                      matches={matches}
                      matchesError={matchesError}
                      matchesLoading={matchesLoading}
                      onGeneratePlanning={handleGeneratePlanning}
                      onPublishPlanning={handlePublishPlanning}
                      onRefreshMatches={loadMatches}
                      onDeclareMatchForfeit={handleDeclareMatchForfeit}
                      onRespondToMatchResult={handleRespondToMatchResult}
                      onSelectMatch={handleSelectMatch}
                      onUpdateMatch={handleUpdateMatch}
                      onUpdateMatchSelection={handleUpdateMatchSelection}
                      onUpdateMatchResult={handleUpdateMatchResult}
                      planningLoading={planningLoading}
                      publishLoading={publishLoading}
                      selectedMatchIdFromQuery={selectedMatchIdFromQuery}
                      viewerRole={authenticatedMember?.role ?? null}
                      viewerTeamId={authenticatedMember?.teamId ?? null}
                      tournament={tournament}
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Box>
    </Container>
  );
};

export default TournamentDetailPage;
