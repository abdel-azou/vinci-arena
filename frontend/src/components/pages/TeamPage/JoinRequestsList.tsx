import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Button,
  TextField,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { JoinRequest, SPECIALTY_LABELS } from '../../../types';

interface JoinRequestsListProps {
  joinRequests: JoinRequest[];
  actionLoading: number | null;
  onManageRequest: (
    requestId: number,
    action: 'accept' | 'reject',
    reason?: string,
  ) => void;
}

const JoinRequestsList = ({
  joinRequests,
  actionLoading,
  onManageRequest,
}: JoinRequestsListProps) => {
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectClick = (requestId: number) => {
    setRejectingId(requestId);
    setRejectReason('');
  };

  const handleConfirmReject = (requestId: number) => {
    if (rejectReason.trim()) {
      onManageRequest(requestId, 'reject', rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const handleCancelReject = () => {
    setRejectingId(null);
    setRejectReason('');
  };

  return (
    <Card
      sx={{
        bgcolor: 'rgba(1, 10, 19, 0.8)',
        border: '1px solid rgba(200, 170, 110, 0.3)',
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{ color: '#c8aa6e', mb: 2, fontWeight: 600 }}
        >
          Demandes d'adhésion ({joinRequests.length})
        </Typography>

        {joinRequests.length === 0 ? (
          <Typography sx={{ color: '#a09b8c', fontStyle: 'italic' }}>
            Aucune demande en attente
          </Typography>
        ) : (
          <Stack spacing={2}>
            {joinRequests.map((request) => {
              const memberTag =
                request.member?.tag || request.memberTag || 'Inconnu';
              const memberSpecialty =
                request.member?.specialty || request.memberSpecialty;

              return (
                <Box
                  key={request.id}
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ color: '#f0e6d2', fontWeight: 600 }}>
                        {memberTag}
                      </Typography>
                      {memberSpecialty && (
                        <Chip
                          label={SPECIALTY_LABELS[memberSpecialty]}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(10, 200, 185, 0.2)',
                            color: '#0ac8b9',
                            border: '1px solid #0ac8b9',
                          }}
                        />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckIcon />}
                        disabled={actionLoading === request.id}
                        onClick={() => onManageRequest(request.id, 'accept')}
                      >
                        Accepter
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CloseIcon />}
                        disabled={actionLoading === request.id}
                        onClick={() => handleRejectClick(request.id)}
                      >
                        Refuser
                      </Button>
                    </Box>
                  </Box>

                  {rejectingId === request.id && (
                    <Box
                      sx={{
                        mt: 2,
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                      }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Raison du refus..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        multiline
                        maxRows={3}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#f0e6d2',
                            '& fieldset': {
                              borderColor: 'rgba(200, 170, 110, 0.3)',
                            },
                            '&:hover fieldset': { borderColor: '#c8aa6e' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#c8aa6e',
                            },
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<SendIcon />}
                        disabled={
                          !rejectReason.trim() || actionLoading === request.id
                        }
                        onClick={() => handleConfirmReject(request.id)}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Confirmer
                      </Button>
                      <Button
                        size="small"
                        onClick={handleCancelReject}
                        sx={{ color: '#a09b8c', whiteSpace: 'nowrap' }}
                      >
                        Annuler
                      </Button>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default JoinRequestsList;
