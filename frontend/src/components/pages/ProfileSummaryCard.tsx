import { Box, Paper, Stack, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { AuthenticatedMember, SPECIALTY_LABELS } from '../../types';
import { formatProfileDate } from './ProfilePage.utils';

type Props = {
  authenticatedMember: AuthenticatedMember;
  teamName: string | null;
};

const ProfileSummaryCard = ({ authenticatedMember, teamName }: Props) => (
  <Box
    sx={{
      mb: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Paper
      variant="outlined"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 380,
        minHeight: 320,
        p: 3,
        borderRadius: 5,
        borderColor: 'rgba(200, 170, 110, 0.26)',
        background:
          'linear-gradient(180deg, rgba(16, 24, 38, 0.98) 0%, rgba(9, 15, 27, 0.98) 100%)',
        textAlign: 'center',
        boxShadow: '0 20px 44px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 'auto 0 0 0',
          height: 5,
          background:
            'linear-gradient(90deg, rgba(200, 170, 110, 0) 0%, rgba(200, 170, 110, 0.92) 50%, rgba(200, 170, 110, 0) 100%)',
        },
      }}
    >
      {authenticatedMember.profileImage ? (
        <Box
          sx={{
            width: 124,
            height: 124,
            borderRadius: '50%',
            border: '3px solid #c8aa6e',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            mb: 1.5,
            boxShadow: '0 0 24px rgba(200, 170, 110, 0.35)',
          }}
        >
          <Box
            component="img"
            src={`/${authenticatedMember.profileImage}`}
            alt="Profile"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: 124,
            height: 124,
            borderRadius: '50%',
            border: '3px solid #c8aa6e',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
          }}
        >
          <PersonIcon sx={{ fontSize: 54, color: '#c8aa6e' }} />
        </Box>
      )}

      <Typography
        variant="h4"
        sx={{
          color: '#f0e6d2',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        {authenticatedMember.tag}
      </Typography>
      <Typography sx={{ mt: 0.5, color: 'rgba(240, 230, 210, 0.72)' }}>
        {authenticatedMember.teamId
          ? (teamName ?? 'Chargement...')
          : 'Sans equipe'}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{ mt: 2.5, flexWrap: 'wrap' }}
      >
        <Box
          sx={{
            px: 1.4,
            py: 0.75,
            borderRadius: 999,
            bgcolor: 'rgba(10, 200, 185, 0.08)',
            border: '1px solid rgba(10, 200, 185, 0.2)',
            color: '#86efe5',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {SPECIALTY_LABELS[authenticatedMember.specialty]}
        </Box>
        <Box
          sx={{
            px: 1.4,
            py: 0.75,
            borderRadius: 999,
            bgcolor: 'rgba(200, 170, 110, 0.08)',
            border: '1px solid rgba(200, 170, 110, 0.2)',
            color: '#f6e7bf',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Membre depuis {formatProfileDate(authenticatedMember.createdAt)}
        </Box>
      </Stack>
    </Paper>
  </Box>
);

export default ProfileSummaryCard;
