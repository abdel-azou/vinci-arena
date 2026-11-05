import { Button, Paper, Stack, Typography } from '@mui/material';
import { DetailSection } from './TournamentDetailPage.utils';

type Props = {
  activeSection: DetailSection;
  onSelectSection: (section: DetailSection) => void;
};

const sections = [
  {
    id: 'overview' as DetailSection,
    label: 'Vue tournoi',
    caption: 'Infos, description, calendrier',
  },
  {
    id: 'participants' as DetailSection,
    label: 'Equipes',
    caption: 'Liste des inscrits',
  },
  {
    id: 'planning' as DetailSection,
    label: 'Planning',
    caption: 'Matches et publication',
  },
];

const TournamentDetailNavigation = ({
  activeSection,
  onSelectSection,
}: Props) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 4,
      borderColor: 'rgba(200, 170, 110, 0.18)',
      background:
        'linear-gradient(180deg, rgba(13, 21, 34, 0.98) 0%, rgba(8, 13, 23, 0.98) 100%)',
      height: { xs: 'auto', md: 620 },
      display: 'flex',
      flexDirection: 'column',
      position: { md: 'sticky' },
      top: 24,
    }}
  >
    <Stack
      spacing={1.25}
      sx={{ flex: 1, alignItems: 'stretch', textAlign: 'center' }}
    >
      {sections.map((section) => {
        const isActive = activeSection === section.id;
        const isDisabled = false;

        return (
          <Button
            key={section.id}
            fullWidth
            disabled={isDisabled}
            onClick={() => onSelectSection(section.id)}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              px: 1.5,
              py: 1.4,
              minHeight: 88,
              flex: 1,
              borderRadius: 3,
              border: '1px solid',
              borderColor: isActive
                ? 'rgba(200, 170, 110, 0.5)'
                : 'rgba(255, 255, 255, 0.08)',
              bgcolor: isActive
                ? 'rgba(200, 170, 110, 0.14)'
                : 'rgba(255, 255, 255, 0.03)',
              color: isActive ? '#fff4d6' : '#f0e6d2',
            }}
          >
            <Stack spacing={0.3} alignItems="center">
              <Typography sx={{ fontWeight: 700 }}>{section.label}</Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(240, 230, 210, 0.68)',
                  textAlign: 'center',
                }}
              >
                {section.caption}
              </Typography>
            </Stack>
          </Button>
        );
      })}
    </Stack>
  </Paper>
);

export default TournamentDetailNavigation;
