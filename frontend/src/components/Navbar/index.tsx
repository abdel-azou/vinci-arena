import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType, SPECIALTY_LABELS } from '../../types';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationBell from '../NotificationBell';

const NavBar = () => {
  const { authenticatedMember, clearMember } =
    useContext<MemberContextType>(MemberContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isResponsible =
    authenticatedMember?.isResponsible ||
    authenticatedMember?.role === 'RESPONSIBLE';
  const isAdmin = authenticatedMember?.role === 'ADMIN';
  const isAdminPageActive =
    location.pathname === '/gestion' || location.pathname === '/admin';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        px: 2,
        background: 'rgba(10, 20, 40, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(200, 170, 110, 0.2)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <Button
        startIcon={<SportsEsportsIcon />}
        onClick={() => navigate('/')}
        sx={{
          color: '#c8aa6e',
          '&:hover': { color: '#f0e6d2', bgcolor: 'rgba(200, 170, 110, 0.1)' },
        }}
      >
        Accueil
      </Button>

      <Box sx={{ flex: 1 }} />

      {authenticatedMember ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body1"
              sx={{
                color: '#f0e6d2',
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}
            >
              {authenticatedMember.tag}
            </Typography>
            <Chip
              label={SPECIALTY_LABELS[authenticatedMember.specialty]}
              size="small"
              sx={{
                bgcolor: 'rgba(10, 200, 185, 0.2)',
                color: '#0ac8b9',
                border: '1px solid #0ac8b9',
                fontWeight: 600,
              }}
            />
            {isAdmin && (
              <Chip
                label="👑 Admin"
                size="small"
                sx={{
                  bgcolor: 'rgba(200, 170, 110, 0.2)',
                  color: '#c8aa6e',
                  border: '1px solid #c8aa6e',
                }}
              />
            )}
          </Box>

          <Button
            startIcon={<PersonIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              color: '#0ac8b9',
              '&:hover': {
                bgcolor: 'rgba(10, 200, 185, 0.1)',
              },
            }}
          >
            Profil
          </Button>

          {isAdmin && (
            <Button
              onClick={() => navigate('/create-tournament')}
              sx={{
                color: '#c8aa6e',
                '&:hover': {
                  bgcolor: 'rgba(200, 170, 110, 0.1)',
                },
              }}
            >
              Créer tournoi
            </Button>
          )}

          <Button
            startIcon={<GroupsIcon />}
            onClick={() => navigate('/teams')}
            sx={{
              color: '#c8aa6e',
              '&:hover': {
                bgcolor: 'rgba(200, 170, 110, 0.1)',
              },
            }}
          >
            Équipes
          </Button>

          <Button
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/members')}
            sx={{
              color: '#c8aa6e',
              '&:hover': {
                bgcolor: 'rgba(200, 170, 110, 0.1)',
              },
            }}
          >
            Membres
          </Button>

          {isAdmin && (
            <Button
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => navigate('/gestion')}
              sx={{
                color: isAdminPageActive ? '#11131d' : '#f0e6d2',
                bgcolor: isAdminPageActive
                  ? '#c8aa6e'
                  : 'rgba(20, 24, 34, 0.92)',
                border: '1px solid rgba(200, 170, 110, 0.5)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                '&:hover': {
                  color: '#11131d',
                  bgcolor: '#d8bc77',
                  borderColor: '#d8bc77',
                },
              }}
            >
              Gestion
            </Button>
          )}

          {!isResponsible && !authenticatedMember.teamId && (
            <Button
              startIcon={<GroupAddIcon />}
              onClick={() => navigate('/create-team')}
              sx={{
                color: '#c8aa6e',
                '&:hover': {
                  bgcolor: 'rgba(200, 170, 110, 0.1)',
                },
              }}
            >
              Créer équipe
            </Button>
          )}

          <Button
            startIcon={<GroupsIcon />}
            onClick={() =>
              navigate(authenticatedMember.teamId ? '/team' : '/teams')
            }
            sx={{
              color: '#c8aa6e',
              '&:hover': {
                bgcolor: 'rgba(200, 170, 110, 0.1)',
              },
            }}
          >
            {authenticatedMember.teamId ? 'Ma Team' : 'Chercher une Team'}
          </Button>

          <Button
            startIcon={<LogoutIcon />}
            onClick={() => clearMember()}
            sx={{
              color: '#a09b8c',
              '&:hover': {
                color: '#c8124a',
                bgcolor: 'rgba(200, 18, 74, 0.1)',
              },
            }}
          >
            Déconnexion
          </Button>

          <NotificationBell />
        </>
      ) : (
        <>
          <Button
            startIcon={<GroupsIcon />}
            onClick={() => navigate('/teams')}
            variant="text"
            size="small"
            sx={{ color: '#c8aa6e' }}
          >
            Équipes
          </Button>
          <Button
            startIcon={<PeopleIcon />}
            onClick={() => navigate('/members')}
            variant="text"
            size="small"
            sx={{ color: '#c8aa6e' }}
          >
            Membres
          </Button>
          <Button
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/register')}
            variant="outlined"
            size="small"
          >
            S&apos;inscrire
          </Button>
          <Button
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            variant="contained"
            size="small"
          >
            Connexion
          </Button>
        </>
      )}
    </Box>
  );
};

export default NavBar;
