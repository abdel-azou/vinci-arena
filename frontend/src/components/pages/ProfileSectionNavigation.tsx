import { ElementType } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { ProfileSection } from './ProfilePage.utils';

type SectionItem = {
  id: ProfileSection;
  label: string;
  caption: string;
  icon: ElementType;
  accentColor: string;
  accentBackground: string;
};

const sectionItems: SectionItem[] = [
  {
    id: 'overview',
    label: "Vue d'ensemble",
    caption: 'Tag, equipe et specialite',
    icon: PersonIcon,
    accentColor: '#0ac8b9',
    accentBackground: 'rgba(10, 200, 185, 0.14)',
  },
  {
    id: 'avatar',
    label: 'Photo de profil',
    caption: 'Choisir ou changer votre avatar',
    icon: PhotoCameraOutlinedIcon,
    accentColor: '#c8aa6e',
    accentBackground: 'rgba(200, 170, 110, 0.14)',
  },
  {
    id: 'availability',
    label: 'Indisponibilites',
    caption: 'Ajouter et gerer vos dates bloquees',
    icon: EventBusyOutlinedIcon,
    accentColor: '#33d17a',
    accentBackground: 'rgba(51, 209, 122, 0.14)',
  },
  {
    id: 'security',
    label: 'Mot de passe',
    caption: 'Modifier votre mot de passe en securite',
    icon: ShieldOutlinedIcon,
    accentColor: '#f2994a',
    accentBackground: 'rgba(242, 153, 74, 0.14)',
  },
  {
    id: 'tournaments',
    label: 'Voir mes tournois',
    caption: 'Acces direct aux tournois ou tu as participe',
    icon: EmojiEventsOutlinedIcon,
    accentColor: '#d4af37',
    accentBackground: 'rgba(212, 175, 55, 0.14)',
  },
];

type Props = {
  activeSection: ProfileSection;
  onSelectSection: (section: ProfileSection) => void;
};

const ProfileSectionNavigation = ({
  activeSection,
  onSelectSection,
}: Props) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(5, minmax(0, 1fr))',
      },
      gap: 2,
      mb: 4,
    }}
  >
    {sectionItems.map((item) => {
      const Icon = item.icon;
      const active = activeSection === item.id;

      return (
        <Box key={item.id}>
          <Button
            fullWidth
            onClick={() => onSelectSection(item.id)}
            sx={{
              p: 0,
              textTransform: 'none',
              alignItems: 'stretch',
              borderRadius: 3,
              height: '100%',
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                width: '100%',
                minHeight: 148,
                p: 2.25,
                borderRadius: 3,
                textAlign: 'left',
                borderColor: active
                  ? item.accentColor
                  : 'rgba(255, 255, 255, 0.08)',
                bgcolor: active
                  ? item.accentBackground
                  : 'rgba(255, 255, 255, 0.03)',
                boxShadow: active
                  ? `0 14px 30px ${item.accentBackground}`
                  : 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: '0 auto 0 0',
                  width: 4,
                  background: item.accentColor,
                  opacity: active ? 1 : 0.45,
                },
              }}
            >
              <Stack spacing={1.2}>
                <Icon
                  sx={{
                    fontSize: 28,
                    color: active ? item.accentColor : '#c8aa6e',
                  }}
                />
                <Typography
                  sx={{
                    color: '#f0e6d2',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(240, 230, 210, 0.68)',
                    lineHeight: 1.5,
                  }}
                >
                  {item.caption}
                </Typography>
              </Stack>
            </Paper>
          </Button>
        </Box>
      );
    })}
  </Box>
);

export default ProfileSectionNavigation;
