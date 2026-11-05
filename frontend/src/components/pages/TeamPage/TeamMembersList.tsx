import { Box, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Memberdto, SPECIALTY_LABELS } from '../../../types';

interface TeamMembersListProps {
  members: Memberdto[];
}

const TeamMembersList = ({ members }: TeamMembersListProps) => {
  const navigate = useNavigate();

  return (
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
          sx={{ color: '#0ac8b9', mb: 2, fontWeight: 600 }}
        >
          Membres de l'équipe ({members.length})
        </Typography>
        <Stack spacing={2}>
          {members.map((member) => (
            <Box
              key={member.id}
              onClick={() => navigate(`/members/${member.id}`)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(10, 200, 185, 0.08)',
                  border: '1px solid rgba(10, 200, 185, 0.3)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: '#f0e6d2', fontWeight: 600 }}>
                  {member.tag}
                </Typography>
                <Chip
                  label={SPECIALTY_LABELS[member.specialty]}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(10, 200, 185, 0.2)',
                    color: '#0ac8b9',
                    border: '1px solid #0ac8b9',
                  }}
                />
              </Box>
              {member.role === 'RESPONSIBLE' && (
                <Chip
                  label="Responsable"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(200, 170, 110, 0.2)',
                    color: '#c8aa6e',
                    border: '1px solid #c8aa6e',
                  }}
                />
              )}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TeamMembersList;
