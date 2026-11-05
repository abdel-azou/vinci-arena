import { ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  TextField,
} from '@mui/material';
import { dateFieldSx, TournamentFormData } from './CreateTournamentPage.utils';

type Props = {
  editingDraftId: number | null;
  formData: TournamentFormData;
  loading: boolean;
  minimumDate: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onReset: () => void;
  onSubmit: (event: FormEvent) => void;
  publishing: boolean;
};

const CreateTournamentDraftForm = ({
  editingDraftId,
  formData,
  loading,
  minimumDate,
  onChange,
  onReset,
  onSubmit,
  publishing,
}: Props) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 2, md: 3 },
      borderRadius: 3,
      borderColor: 'rgba(200, 170, 110, 0.2)',
      background:
        'linear-gradient(180deg, rgba(15, 26, 47, 0.88) 0%, rgba(7, 13, 23, 0.92) 100%)',
    }}
  >
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={8}>
          <TextField
            required
            fullWidth
            id="name"
            name="name"
            label="Nom du tournoi"
            value={formData.name}
            onChange={onChange}
            disabled={loading}
            inputProps={{ maxLength: 20 }}
            helperText={`${formData.name.length}/20 caractères`}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            id="maxTeams"
            name="maxTeams"
            label="Places"
            type="number"
            value={formData.maxTeams}
            onChange={onChange}
            disabled={loading}
            inputProps={{ min: 1, step: 1 }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            minRows={4}
            value={formData.description}
            onChange={onChange}
            disabled={loading}
            inputProps={{ maxLength: 50 }}
            helperText={`${formData.description.length}/50 caractères`}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            id="registrationDeadline"
            name="registrationDeadline"
            label="Date limite d'inscription"
            type="date"
            value={formData.registrationDeadline}
            onChange={onChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minimumDate }}
            disabled={loading}
            sx={dateFieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            id="startDate"
            name="startDate"
            label="Début du tournoi"
            type="date"
            value={formData.startDate}
            onChange={onChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minimumDate }}
            disabled={loading}
            sx={dateFieldSx}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            required
            fullWidth
            id="endDate"
            name="endDate"
            label="Fin du tournoi"
            type="date"
            value={formData.endDate}
            onChange={onChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: minimumDate }}
            disabled={loading}
            sx={dateFieldSx}
          />
        </Grid>

        <Grid item xs={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 1 }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || publishing}
              sx={{ py: 1.4 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingDraftId ? (
                'Mettre à jour le brouillon'
              ) : (
                'Créer le tournoi'
              )}
            </Button>

            {editingDraftId && (
              <Button
                fullWidth
                variant="outlined"
                disabled={loading || publishing}
                onClick={onReset}
              >
                Annuler la modification
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  </Paper>
);

export default CreateTournamentDraftForm;
