import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { MemberUnavailability } from '../../types';

type Props = {
  endDate: string;
  onAddUnavailability: () => void;
  onDeleteUnavailability: (id: number) => void;
  onEndDateChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  startDate: string;
  today: string;
  unavailabilities: MemberUnavailability[];
  unavailabilityErrorMessage: string;
};

const ProfileAvailabilitySection = ({
  endDate,
  onAddUnavailability,
  onDeleteUnavailability,
  onEndDateChange,
  onStartDateChange,
  startDate,
  today,
  unavailabilities,
  unavailabilityErrorMessage,
}: Props) => (
  <Stack spacing={2.5}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="overline"
        sx={{ color: '#0ac8b9', letterSpacing: 1.2 }}
      >
        Planning
      </Typography>
      <Typography variant="h5" sx={{ color: '#f0e6d2', fontWeight: 700 }}>
        Mes indisponibilites
      </Typography>
      <Typography sx={{ mt: 1, color: 'rgba(240, 230, 210, 0.7)' }}>
        Ajoute ici les periodes pendant lesquelles tu ne peux pas jouer.
      </Typography>
    </Box>

    {unavailabilityErrorMessage && (
      <Alert severity="error">{unavailabilityErrorMessage}</Alert>
    )}

    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'rgba(10, 200, 185, 0.05)',
        borderColor: 'rgba(10, 200, 185, 0.2)',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          type="date"
          label="Début"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          fullWidth
        />
        <TextField
          type="date"
          label="Fin"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: today }}
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={onAddUnavailability}>
          Ajouter cette indisponibilite
        </Button>
      </Stack>

      <Stack spacing={1.25}>
        {unavailabilities.length === 0 && (
          <Typography sx={{ color: 'rgba(240, 230, 210, 0.65)' }}>
            Aucune indisponibilité enregistrée.
          </Typography>
        )}
        {unavailabilities.map((unavailability) => (
          <Paper
            key={unavailability.id}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1.5}
            >
              <Typography sx={{ color: '#f0e6d2' }}>
                {unavailability.startDate} → {unavailability.endDate}
              </Typography>
              <Button
                color="error"
                size="small"
                onClick={() => onDeleteUnavailability(unavailability.id)}
              >
                Supprimer
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  </Stack>
);

export default ProfileAvailabilitySection;
