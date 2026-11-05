import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { AuthenticatedMember } from '../../types';

type Props = {
  authenticatedMember: AuthenticatedMember;
  avatarErrorMessage: string;
  avatarLoading: boolean;
  avatarSuccessMessage: string;
  avatars: string[];
  editingAvatar: boolean;
  newProfileImage: string;
  onCancelEditAvatar: () => void;
  onEditAvatar: () => void;
  onSelectAvatar: (avatar: string) => void;
  onUpdateProfileImage: () => void;
};

const ProfileAvatarSection = ({
  authenticatedMember,
  avatarErrorMessage,
  avatarLoading,
  avatarSuccessMessage,
  avatars,
  editingAvatar,
  newProfileImage,
  onCancelEditAvatar,
  onEditAvatar,
  onSelectAvatar,
  onUpdateProfileImage,
}: Props) => (
  <Stack spacing={2.5}>
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        variant="overline"
        sx={{ color: '#c8aa6e', letterSpacing: 1.2 }}
      >
        Personnalisation
      </Typography>
      <Typography variant="h5" sx={{ color: '#f0e6d2', fontWeight: 700 }}>
        Image de profil
      </Typography>
    </Box>

    {!editingAvatar ? (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'rgba(200, 170, 110, 0.05)',
          borderColor: 'rgba(200, 170, 110, 0.2)',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              border: '3px solid #c8aa6e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              bgcolor: '#010a13',
            }}
          >
            {authenticatedMember.profileImage ? (
              <Box
                component="img"
                src={`/${authenticatedMember.profileImage}`}
                alt="Avatar actuel"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <PersonIcon sx={{ color: '#c8aa6e', fontSize: 44 }} />
            )}
          </Box>
          <Button
            startIcon={<EditIcon />}
            onClick={onEditAvatar}
            variant="contained"
            sx={{
              bgcolor: '#c8aa6e',
              color: '#08111d',
              '&:hover': { bgcolor: '#b5985d' },
            }}
          >
            Choisir un nouvel avatar
          </Button>
        </Stack>
      </Paper>
    ) : (
      <Box>
        {avatarErrorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {avatarErrorMessage}
          </Alert>
        )}
        {avatarSuccessMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {avatarSuccessMessage}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(72px, 1fr))',
            gap: 1.5,
            mb: 2,
          }}
        >
          {avatars.map((avatar) => (
            <Box
              key={avatar}
              onClick={() => onSelectAvatar(avatar)}
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                border:
                  newProfileImage === avatar
                    ? '3px solid #c8aa6e'
                    : '2px solid rgba(200, 170, 110, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: '#000',
                boxShadow:
                  newProfileImage === avatar
                    ? '0 0 16px rgba(200, 170, 110, 0.45)'
                    : 'none',
              }}
            >
              <Box
                component="img"
                src={`/${avatar}`}
                alt={avatar}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            startIcon={<CheckIcon />}
            onClick={onUpdateProfileImage}
            disabled={avatarLoading}
            variant="contained"
            sx={{
              flex: 1,
              bgcolor: '#c8aa6e',
              color: '#010a13',
              '&:hover': { bgcolor: '#b5985d' },
            }}
          >
            {avatarLoading ? 'Mise a jour...' : 'Valider'}
          </Button>
          <Button
            startIcon={<CloseIcon />}
            onClick={onCancelEditAvatar}
            disabled={avatarLoading}
            variant="outlined"
            sx={{
              flex: 1,
              color: '#a09b8c',
              borderColor: '#a09b8c',
            }}
          >
            Annuler
          </Button>
        </Stack>
      </Box>
    )}
  </Stack>
);

export default ProfileAvatarSection;
