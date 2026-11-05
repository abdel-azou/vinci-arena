import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { TournamentResponse } from '../../services/tournamentService';
import {
  formatTournamentDate,
  getTournamentStatusChipSx,
  getTournamentStatusLabel,
  heroCardSx,
  isRegistrationOpen,
  metricPaperSx,
} from './TournamentDetailPage.utils';

type Props = {
  onBackHome: () => void;
  onRegisterMyTeam: () => void;
  registrationLoading: boolean;
  canRegisterMyTeam: boolean;
  tournamentIsJoinable: boolean;
  tournament: TournamentResponse;
};

const TournamentOverviewSection = ({
  onBackHome,
  onRegisterMyTeam,
  registrationLoading,
  canRegisterMyTeam,
  tournamentIsJoinable,
  tournament,
}: Props) => (
  <Card
    variant="outlined"
    sx={{ ...heroCardSx, height: { xs: 'auto', md: 620 } }}
  >
    <CardContent
      sx={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: 980,
          mx: 'auto',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: '#c8aa6e', letterSpacing: 1.4 }}
          >
            Tournoi
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: '#f7f2e7',
              fontWeight: 800,
              lineHeight: 1.05,
            }}
          >
            {tournament.name}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          justifyContent="center"
        >
          <Chip
            label={getTournamentStatusLabel(tournament.status)}
            sx={{
              fontWeight: 700,
              ...getTournamentStatusChipSx(tournament.status),
            }}
          />
          <Chip
            label={`${tournament.registeredTeamsCount}/${tournament.maxTeams} equipes`}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#f0e6d2',
              borderColor: 'rgba(255, 255, 255, 0.14)',
            }}
          />
          {tournament.winnerTeamName && (
            <Chip
              label={`Gagnant : ${tournament.winnerTeamName}`}
              sx={{
                bgcolor: 'rgba(200, 170, 110, 0.14)',
                color: '#fff6de',
                borderColor: 'rgba(200, 170, 110, 0.28)',
              }}
            />
          )}
        </Stack>

        <Typography
          sx={{
            color: '#f5f7fb',
            fontSize: '1.06rem',
            lineHeight: 1.85,
            maxWidth: '56ch',
          }}
        >
          {tournament.description.length > 100
            ? `${tournament.description.substring(0, 100)}...`
            : tournament.description}
        </Typography>

        <Grid
          container
          spacing={1.75}
          justifyContent="center"
          sx={{ width: '100%', maxWidth: 980 }}
        >
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Paper variant="outlined" sx={{ ...metricPaperSx, width: '100%' }}>
              <Typography
                variant="overline"
                sx={{ color: 'rgba(240, 230, 210, 0.72)' }}
              >
                Date de debut
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#ffffff', fontWeight: 700 }}
              >
                {formatTournamentDate(tournament.startDate)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Paper variant="outlined" sx={{ ...metricPaperSx, width: '100%' }}>
              <Typography
                variant="overline"
                sx={{ color: 'rgba(240, 230, 210, 0.72)' }}
              >
                Date de fin
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#ffffff', fontWeight: 700 }}
              >
                {formatTournamentDate(tournament.endDate)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Paper variant="outlined" sx={{ ...metricPaperSx, width: '100%' }}>
              <Typography
                variant="overline"
                sx={{ color: 'rgba(240, 230, 210, 0.72)' }}
              >
                Date limite d&apos;inscription
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#ffffff', fontWeight: 700 }}
              >
                {formatTournamentDate(tournament.registrationDeadline)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Stack
          spacing={0.75}
          alignItems="center"
          sx={{
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            width: '100%',
            maxWidth: 760,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.84)' }}
          >
            Inscriptions{' '}
            {isRegistrationOpen(tournament) ? 'ouvertes' : 'fermees'}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.62)' }}
          >
            Places restantes :{' '}
            {Math.max(tournament.maxTeams - tournament.registeredTeamsCount, 0)}
          </Typography>
          {canRegisterMyTeam && (
            <Button
              variant="contained"
              onClick={onRegisterMyTeam}
              disabled={registrationLoading || !tournamentIsJoinable}
              sx={{
                minWidth: 240,
                py: 1.1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #c8aa6e 0%, #b58b3c 100%)',
                color: '#111827',
                boxShadow: '0 10px 24px rgba(200, 170, 110, 0.28)',
              }}
            >
              {registrationLoading ? 'Inscription...' : 'Inscrire ma team'}
            </Button>
          )}
          <Button
            variant="text"
            onClick={onBackHome}
            sx={{
              color: '#e0c889',
              fontWeight: 700,
              minWidth: 'auto',
            }}
          >
            Retour a l&apos;accueil
          </Button>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default TournamentOverviewSection;
