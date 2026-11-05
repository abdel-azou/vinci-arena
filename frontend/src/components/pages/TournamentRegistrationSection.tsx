import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import { TournamentResponse } from '../../services/tournamentService';
import {
  actionCardSx,
  getRegistrationStatusMessage,
} from './TournamentDetailPage.utils';

type Props = {
  onRegisterMyTeam: () => void;
  registrationLoading: boolean;
  tournament: TournamentResponse;
  tournamentIsJoinable: boolean;
};

const TournamentRegistrationSection = ({
  onRegisterMyTeam,
  registrationLoading,
  tournament,
  tournamentIsJoinable,
}: Props) => (
  <Card
    variant="outlined"
    sx={{ ...actionCardSx, height: { xs: 'auto', md: 620 } }}
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
        spacing={2.5}
        sx={{
          width: '100%',
          maxWidth: 640,
          mx: 'auto',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center',
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: '#c8aa6e', letterSpacing: 1.2 }}
          >
            Action equipe
          </Typography>
          <Typography variant="h5" sx={{ color: '#f0e6d2', fontWeight: 700 }}>
            Inscription de votre team
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 0.75, maxWidth: '54ch' }}
          >
            Depuis cette page, un responsable peut inscrire sa team a ce
            tournoi.
          </Typography>
        </Box>

        <Button
          size="large"
          variant="contained"
          onClick={onRegisterMyTeam}
          disabled={registrationLoading || !tournamentIsJoinable}
          sx={{
            minWidth: 240,
            py: 1.25,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
            color: '#111827',
            boxShadow: '0 10px 24px rgba(200, 170, 110, 0.28)',
          }}
        >
          {registrationLoading ? 'Inscription en cours...' : 'Inscrire ma team'}
        </Button>

        {getRegistrationStatusMessage(tournament) && (
          <Alert severity="warning" sx={{ width: '100%' }}>
            {getRegistrationStatusMessage(tournament)}
          </Alert>
        )}
      </Stack>
    </CardContent>
  </Card>
);

export default TournamentRegistrationSection;
