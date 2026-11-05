import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { TournamentResponse } from '../../services/tournamentService';
import { rosterCardSx, teamPaperSx } from './TournamentDetailPage.utils';

type Props = {
  tournament: TournamentResponse;
};

const TournamentParticipantsSection = ({ tournament }: Props) => (
  <Card
    variant="outlined"
    sx={{ ...rosterCardSx, height: { xs: 'auto', md: 620 } }}
  >
    <CardContent
      sx={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: 980,
          mx: 'auto',
          minHeight: '100%',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: '#c8aa6e', letterSpacing: 1.2 }}
            >
              Participants
            </Typography>
            <Typography variant="h6" sx={{ color: '#f0e6d2', fontWeight: 700 }}>
              Equipes inscrites
            </Typography>
          </Box>
          <Chip
            label={`${tournament.registeredTeamsCount}/${tournament.maxTeams}`}
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#f0e6d2',
              fontWeight: 700,
            }}
          />
        </Stack>

        {tournament.registeredTeamNames.length === 0 && (
          <Typography color="text.secondary">
            Aucune equipe n&apos;est inscrite pour le moment.
          </Typography>
        )}

        {tournament.registeredTeamNames.length > 0 && (
          <Box
            sx={{
              width: '100%',
              flexGrow: 1,
              overflowY: { xs: 'visible', md: 'auto' },
              pr: { md: 1 },
            }}
          >
            <Grid
              container
              spacing={2}
              justifyContent="center"
              sx={{ width: '100%' }}
            >
              {tournament.registeredTeamNames.map((team, index) => (
                <Grid
                  item
                  key={team}
                  xs={12}
                  sm={6}
                  xl={4}
                  sx={{ display: 'flex' }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      ...teamPaperSx,
                      width: '100%',
                      minHeight: 110,
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(240, 230, 210, 0.65)' }}
                      >
                        Equipe {index + 1}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#f0e6d2',
                          fontWeight: 700,
                        }}
                      >
                        {team}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export default TournamentParticipantsSection;
