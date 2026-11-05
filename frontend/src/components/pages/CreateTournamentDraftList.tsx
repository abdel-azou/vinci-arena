import {
  Alert,
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
  drafts: TournamentResponse[];
  draftsError: string | null;
  draftsLoading: boolean;
  formatDate: (value: string) => string;
  onSelectDraft: (draftId: number) => void;
  selectedDraftId: number | null;
};

const CreateTournamentDraftList = ({
  drafts,
  draftsError,
  draftsLoading,
  formatDate,
  onSelectDraft,
  selectedDraftId,
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
      Brouillons admin
    </Typography>

    <Typography sx={{ color: '#c8aa6e', mt: 0.5 }}>
      Les tournois en `PREPARATION` restent ici tant qu&apos;ils ne sont pas
      publiés. Tous les admins peuvent les reprendre, les modifier ou les
      publier.
    </Typography>

    <Divider sx={{ borderColor: 'rgba(200, 170, 110, 0.2)', my: 2 }} />

    {draftsError && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {draftsError}
      </Alert>
    )}

    {draftsLoading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    ) : drafts.length === 0 ? (
      <Paper
        variant="outlined"
        sx={{
          p: 2.5,
          borderRadius: 2.5,
          borderStyle: 'dashed',
          borderColor: 'rgba(200, 170, 110, 0.22)',
          bgcolor: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <Typography sx={{ color: '#a09b8c', textAlign: 'center' }}>
          Aucun brouillon pour l&apos;instant.
        </Typography>
      </Paper>
    ) : (
      <Grid container spacing={1.5}>
        {drafts.map((draft) => (
          <Grid item xs={12} sm={6} md={4} key={draft.id}>
            <Button
              fullWidth
              variant="text"
              onClick={() => onSelectDraft(draft.id)}
              sx={{ p: 0, textTransform: 'none', alignItems: 'stretch' }}
            >
              <Paper
                variant="outlined"
                sx={{
                  width: '100%',
                  p: 2,
                  borderRadius: 2.5,
                  textAlign: 'left',
                  borderColor:
                    selectedDraftId === draft.id
                      ? 'rgba(200, 170, 110, 0.55)'
                      : 'rgba(200, 170, 110, 0.16)',
                  bgcolor:
                    selectedDraftId === draft.id
                      ? 'rgba(200, 170, 110, 0.12)'
                      : 'rgba(255, 255, 255, 0.03)',
                  boxShadow:
                    selectedDraftId === draft.id
                      ? '0 10px 24px rgba(200, 170, 110, 0.12)'
                      : 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '0 auto 0 0',
                    width: 4,
                    background:
                      selectedDraftId === draft.id
                        ? '#c8aa6e'
                        : 'rgba(200, 170, 110, 0.35)',
                  },
                }}
              >
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      color: '#f0e6d2',
                      fontWeight: 700,
                      lineHeight: 1.35,
                    }}
                  >
                    {draft.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(240, 230, 210, 0.65)' }}
                  >
                    {formatDate(draft.startDate)} • {draft.maxTeams} places
                  </Typography>
                  <Box
                    sx={{
                      alignSelf: 'flex-start',
                      px: 1.2,
                      py: 0.5,
                      borderRadius: 999,
                      bgcolor: 'rgba(200, 170, 110, 0.12)',
                      border: '1px solid rgba(200, 170, 110, 0.22)',
                      color: '#f0e6d2',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {draft.status}
                  </Box>
                </Stack>
              </Paper>
            </Button>
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);

export default CreateTournamentDraftList;
