import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { TournamentResponse } from '../../services/tournamentService';

type Props = {
  formatDate: (value: string) => string;
  loading: boolean;
  onEdit: () => void;
  onPublish: () => void;
  publishing: boolean;
  selectedDraft: TournamentResponse;
};

const CreateTournamentSelectedDraft = ({
  formatDate,
  loading,
  onEdit,
  onPublish,
  publishing,
  selectedDraft,
}: Props) => (
  <Box
    sx={{
      mt: 4,
      p: 3,
      borderRadius: 3,
      border: '1px solid rgba(200, 170, 110, 0.35)',
      background:
        'linear-gradient(180deg, rgba(15, 26, 47, 0.92) 0%, rgba(7, 13, 23, 0.95) 100%)',
    }}
  >
    <Typography
      variant="h6"
      sx={{
        color: '#f0e6d2',
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
    >
      Brouillon actuel
    </Typography>

    <Typography sx={{ color: '#c8aa6e', mt: 0.5, mb: 2 }}>
      Ce tournoi est en `PREPARATION`. Il n&apos;est pas encore public.
    </Typography>

    <Divider sx={{ borderColor: 'rgba(200, 170, 110, 0.2)', mb: 2 }} />

    <Grid container spacing={2}>
      <Grid item xs={12} md={7}>
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            height: '100%',
            borderColor: 'rgba(200, 170, 110, 0.16)',
            bgcolor: 'rgba(255, 255, 255, 0.03)',
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: '#c8aa6e', letterSpacing: '0.1em' }}
          >
            Présentation
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: '#f0e6d2', fontWeight: 700, mb: 1.5 }}
          >
            {selectedDraft.name}
          </Typography>
          <Typography
            sx={{
              color: 'rgba(240, 230, 210, 0.8)',
              lineHeight: 1.7,
            }}
          >
            {selectedDraft.description}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={5}>
        <Stack spacing={1.5}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              borderColor: 'rgba(200, 170, 110, 0.16)',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: '#c8aa6e', letterSpacing: '0.1em' }}
            >
              Date limite d&apos;inscription
            </Typography>
            <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
              {formatDate(selectedDraft.registrationDeadline)}
            </Typography>
          </Paper>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              borderColor: 'rgba(200, 170, 110, 0.16)',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: '#c8aa6e', letterSpacing: '0.1em' }}
            >
              Début du tournoi
            </Typography>
            <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
              {formatDate(selectedDraft.startDate)}
            </Typography>
          </Paper>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              borderColor: 'rgba(200, 170, 110, 0.16)',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
            }}
          >
            <Typography
              variant="overline"
              sx={{ color: '#c8aa6e', letterSpacing: '0.1em' }}
            >
              Fin et capacité
            </Typography>
            <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
              {formatDate(selectedDraft.endDate)}
            </Typography>
            <Typography sx={{ color: 'rgba(240, 230, 210, 0.72)' }}>
              {selectedDraft.maxTeams} équipes maximum
            </Typography>
          </Paper>
        </Stack>
      </Grid>
    </Grid>

    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
      <Button
        fullWidth
        variant="outlined"
        onClick={onEdit}
        disabled={loading || publishing}
      >
        Modifier
      </Button>
      <Button
        fullWidth
        variant="contained"
        onClick={onPublish}
        disabled={loading || publishing}
      >
        {publishing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Publier'
        )}
      </Button>
    </Stack>
  </Box>
);

export default CreateTournamentSelectedDraft;
