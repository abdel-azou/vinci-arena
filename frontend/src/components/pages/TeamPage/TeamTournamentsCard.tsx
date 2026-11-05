import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';

type Props = {
  teamName: string;
  registeredTournamentNames: string[];
};

const TeamTournamentsCard = ({
  teamName,
  registeredTournamentNames,
}: Props) => (
  <Card
    sx={{
      bgcolor: 'rgba(1, 10, 19, 0.8)',
      border: '1px solid rgba(200, 170, 110, 0.3)',
      mb: 4,
    }}
  >
    <CardContent>
      <Typography
        variant="h6"
        sx={{ color: '#c8aa6e', mb: 1.5, fontWeight: 600 }}
      >
        Tournois de {teamName}
      </Typography>

      {registeredTournamentNames.length === 0 ? (
        <Typography sx={{ color: '#a09b8c' }}>
          Cette équipe n&apos;est inscrite à aucun tournoi pour le moment.
        </Typography>
      ) : (
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {registeredTournamentNames.map((tournamentName) => (
            <Chip
              key={tournamentName}
              label={tournamentName}
              sx={{
                bgcolor: 'rgba(200, 170, 110, 0.12)',
                border: '1px solid rgba(200, 170, 110, 0.28)',
                color: '#f0e6d2',
              }}
            />
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default TeamTournamentsCard;
