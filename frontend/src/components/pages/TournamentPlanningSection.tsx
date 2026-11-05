import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  TournamentMatchResponse,
  TournamentResponse,
  UpdateMatchSelectionPayload,
  UpdateTournamentMatchPayload,
} from '../../services/tournamentService';
import { getTeamMembers } from '../../services/teamService';
import { MemberRole, Memberdto } from '../../types';
import { rosterCardSx, teamPaperSx } from './TournamentDetailPage.utils';

const toInputDateTime = (value: string | null) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatScheduledDateTime = (value: string | null) => {
  if (!value) {
    return 'Date a definir';
  }
  const date = new Date(value);
  return date.toLocaleString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getRoundLabel = (round: string) => {
  switch (round) {
    case 'FINAL':
      return 'Finale';
    case 'SEMI_FINAL':
      return '1/2 finale';
    case 'QUARTER_FINAL':
      return '1/4 finale';
    case 'ROUND_OF_16':
      return '1/8 finale';
    case 'ROUND_OF_32':
      return '1/16 finale';
    case 'ROUND_OF_64':
      return '1/32 finale';
    case 'ROUND_OF_128':
      return '1/64 finale';
    case 'PREMIER_TOUR':
      return 'Premier tour';
    default:
      return round;
  }
};

const getResultStatusLabel = (status: string) => {
  switch (status) {
    case 'NOT_ENCODED':
      return 'Aucun resultat';
    case 'PENDING_CONFIRMATION':
      return 'En attente de validation';
    case 'CONFIRMED':
      return 'Resultat confirme';
    case 'DISPUTED':
      return 'Resultat conteste';
    default:
      return status;
  }
};

const getTeamResponseLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'CONFIRMED':
      return 'Confirme';
    case 'CORRECTED':
      return 'Corrige';
    case 'REFUSED':
      return 'Refuse';
    default:
      return status;
  }
};

type DisplayScore = {
  teamAScore: number;
  teamBScore: number;
  isSynthetic: boolean;
};

const buildSyntheticScore = (match: TournamentMatchResponse) => {
  const seed =
    match.id * 17 +
    (match.teamAId ?? 0) * 13 +
    (match.teamBId ?? 0) * 11 +
    match.round.length;
  const teamAScore = seed % 4;
  let teamBScore = Math.floor(seed / 3) % 4;

  if (teamAScore === teamBScore) {
    teamBScore = (teamBScore + 1) % 5;
  }

  return { teamAScore, teamBScore };
};

const getDisplayScoreForMatch = (
  match: TournamentMatchResponse,
  nowTimestamp: number,
): DisplayScore | null => {
  if (match.teamAScore != null && match.teamBScore != null) {
    return {
      teamAScore: match.teamAScore,
      teamBScore: match.teamBScore,
      isSynthetic: false,
    };
  }

  if (match.isBye || !match.scheduledDate) {
    return null;
  }

  if (new Date(match.scheduledDate).getTime() > nowTimestamp) {
    return null;
  }

  return {
    ...buildSyntheticScore(match),
    isSynthetic: true,
  };
};

type DraftMatch = {
  teamAId: string;
  teamBId: string;
  scheduledDate: string;
};

type DraftSelection = {
  playerIds: number[];
};

type DraftResult = {
  teamAScore: string;
  teamBScore: string;
};

type Props = {
  tournament: TournamentResponse;
  matches: TournamentMatchResponse[];
  matchesLoading: boolean;
  matchesError: string | null;
  isAdmin: boolean;
  canGeneratePlanning: boolean;
  planningLoading: boolean;
  publishLoading: boolean;
  selectedMatchIdFromQuery: number | null;
  viewerTeamId: number | null;
  viewerRole: MemberRole | null;
  onGeneratePlanning: () => void;
  onRefreshMatches: () => void;
  onSelectMatch: (matchId: number | null) => void;
  onPublishPlanning: () => void;
  onUpdateMatch: (
    matchId: number,
    payload: UpdateTournamentMatchPayload,
  ) => Promise<void>;
  onUpdateMatchSelection: (
    matchId: number,
    payload: UpdateMatchSelectionPayload,
  ) => Promise<void>;
  onUpdateMatchResult: (
    matchId: number,
    payload: { teamAScore: number; teamBScore: number },
  ) => Promise<void>;
  onDeclareMatchForfeit: (matchId: number) => Promise<void>;
  onRespondToMatchResult: (
    matchId: number,
    payload: {
      action: 'CONFIRM' | 'CORRECT' | 'REFUSE';
      teamAScore?: number;
      teamBScore?: number;
    },
  ) => Promise<void>;
};

const TournamentPlanningSection = ({
  tournament,
  matches,
  matchesLoading,
  matchesError,
  isAdmin,
  canGeneratePlanning,
  planningLoading,
  publishLoading,
  selectedMatchIdFromQuery,
  viewerTeamId,
  viewerRole,
  onGeneratePlanning,
  onRefreshMatches,
  onSelectMatch,
  onPublishPlanning,
  onUpdateMatch,
  onUpdateMatchSelection,
  onUpdateMatchResult,
  onDeclareMatchForfeit,
  onRespondToMatchResult,
}: Props) => {
  const [drafts, setDrafts] = useState<Record<number, DraftMatch>>({});
  const [selectionDrafts, setSelectionDrafts] = useState<
    Record<number, DraftSelection>
  >({});
  const [resultDrafts, setResultDrafts] = useState<Record<number, DraftResult>>(
    {},
  );
  const [teamMembersByTeamId, setTeamMembersByTeamId] = useState<
    Record<number, Memberdto[]>
  >({});
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectionSuccess, setSelectionSuccess] = useState<string | null>(null);
  const [selectionSaving, setSelectionSaving] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [resultSuccess, setResultSuccess] = useState<string | null>(null);
  const [resultSaving, setResultSaving] = useState(false);
  const [forfeitSaving, setForfeitSaving] = useState(false);
  const [savingMatchId, setSavingMatchId] = useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const teamOptions = useMemo(() => {
    if (tournament.participantTeams.length > 0) {
      return tournament.participantTeams.map((team) => ({
        id: team.teamId,
        name: team.teamName,
      }));
    }
    return tournament.registeredTeamNames.map((name, index) => ({
      id: index + 1,
      name,
    }));
  }, [tournament]);

  useEffect(() => {
    const nextDrafts: Record<number, DraftMatch> = {};
    const nextSelectionDrafts: Record<number, DraftSelection> = {};
    const nextResultDrafts: Record<number, DraftResult> = {};
    matches.forEach((match) => {
      nextDrafts[match.id] = {
        teamAId: match.teamAId ? String(match.teamAId) : '',
        teamBId: match.teamBId ? String(match.teamBId) : '',
        scheduledDate: toInputDateTime(match.scheduledDate),
      };
      nextResultDrafts[match.id] = {
        teamAScore: match.teamAScore == null ? '' : String(match.teamAScore),
        teamBScore: match.teamBScore == null ? '' : String(match.teamBScore),
      };

      if (viewerTeamId != null) {
        if (match.teamAId === viewerTeamId) {
          nextSelectionDrafts[match.id] = {
            playerIds: match.selectionForTeamA.map((player) => player.id),
          };
        } else if (match.teamBId === viewerTeamId) {
          nextSelectionDrafts[match.id] = {
            playerIds: match.selectionForTeamB.map((player) => player.id),
          };
        }
      }
    });
    setDrafts(nextDrafts);
    setSelectionDrafts(nextSelectionDrafts);
    setResultDrafts(nextResultDrafts);

    setSelectedMatchId((current) => {
      if (
        selectedMatchIdFromQuery != null &&
        matches.some((match) => match.id === selectedMatchIdFromQuery)
      ) {
        return selectedMatchIdFromQuery;
      }

      if (current != null && matches.some((match) => match.id === current)) {
        return current;
      }

      return matches.length > 0 ? matches[0].id : null;
    });
    setIsEditing(false);
  }, [matches, selectedMatchIdFromQuery, viewerTeamId]);

  useEffect(() => {
    if (selectedMatchId != null) {
      onSelectMatch(selectedMatchId);
    }
  }, [onSelectMatch, selectedMatchId]);

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (
        (viewerRole !== 'RESPONSIBLE' && viewerRole !== 'ADMIN') ||
        viewerTeamId == null
      ) {
        return;
      }

      const ids = new Set<number>();
      matches.forEach((match) => {
        if (
          match.status !== 'PUBLISHED' ||
          !match.scheduledDate ||
          new Date(match.scheduledDate).getTime() <= Date.now()
        ) {
          return;
        }

        if (match.teamAId === viewerTeamId && match.teamAId) {
          ids.add(match.teamAId);
        }
        if (match.teamBId === viewerTeamId && match.teamBId) {
          ids.add(match.teamBId);
        }
      });

      if (ids.size === 0) {
        return;
      }

      try {
        const entries = await Promise.all(
          Array.from(ids).map(async (teamId) => {
            const members = await getTeamMembers(teamId);
            return [teamId, members] as const;
          }),
        );

        setTeamMembersByTeamId((prev) => {
          const next = { ...prev };
          entries.forEach(([teamId, members]) => {
            next[teamId] = members;
          });
          return next;
        });

        setSelectionError(null);
      } catch {
        setSelectionError("Impossible de charger les membres de l'équipe");
      }
    };

    void loadTeamMembers();
  }, [matches, viewerRole, viewerTeamId]);

  const handleDraftChange = (
    matchId: number,
    field: keyof DraftMatch,
    value: string,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedMatchId) {
      return;
    }
    const draft = drafts[selectedMatchId];
    if (!draft?.teamAId || !draft.scheduledDate) {
      setUpdateError(
        'Selectionne une equipe et une date avant de sauvegarder.',
      );
      setUpdateSuccess(null);
      return;
    }

    try {
      setSavingMatchId(selectedMatchId);
      setUpdateError(null);
      setUpdateSuccess(null);

      await onUpdateMatch(selectedMatchId, {
        teamAId: Number(draft.teamAId),
        teamBId: draft.teamBId ? Number(draft.teamBId) : null,
        scheduledDate: draft.scheduledDate,
      });

      setUpdateSuccess('Match mis a jour.');
    } catch (error) {
      setUpdateError(
        error instanceof Error
          ? error.message
          : 'Impossible de modifier le match',
      );
    } finally {
      setSavingMatchId(null);
    }
  };

  const handleSelectionToggle = (matchId: number, playerId: number) => {
    setSelectionDrafts((prev) => {
      const current = prev[matchId]?.playerIds ?? [];
      const exists = current.includes(playerId);
      const nextPlayers = exists
        ? current.filter((id) => id !== playerId)
        : current.length >= 4
          ? current
          : [...current, playerId];

      return {
        ...prev,
        [matchId]: {
          playerIds: nextPlayers,
        },
      };
    });
  };

  const handleResultDraftChange = (
    matchId: number,
    field: keyof DraftResult,
    value: string,
  ) => {
    setResultDrafts((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  const handleSaveSelection = async () => {
    if (!selectedMatchId) {
      return;
    }

    const playerIds = selectionDrafts[selectedMatchId]?.playerIds ?? [];
    if (playerIds.length < 1 || playerIds.length > 4) {
      setSelectionError('La sélection doit contenir entre 1 et 4 joueurs.');
      setSelectionSuccess(null);
      return;
    }

    try {
      setSelectionSaving(true);
      setSelectionError(null);
      setSelectionSuccess(null);

      await onUpdateMatchSelection(selectedMatchId, { playerIds });
      setSelectionSuccess('Sélection sauvegardée.');
    } catch (error) {
      setSelectionError(
        error instanceof Error
          ? error.message
          : 'Impossible de sauvegarder la sélection',
      );
    } finally {
      setSelectionSaving(false);
    }
  };

  const handleSaveResult = async () => {
    if (!selectedMatchId) {
      return;
    }

    const draft = resultDrafts[selectedMatchId];
    const teamAScore = Number(draft?.teamAScore);
    const teamBScore = Number(draft?.teamBScore);
    if (
      !draft ||
      draft.teamAScore === '' ||
      draft.teamBScore === '' ||
      Number.isNaN(teamAScore) ||
      Number.isNaN(teamBScore) ||
      teamAScore < 0 ||
      teamBScore < 0
    ) {
      setResultError('Encode un score valide pour les deux equipes.');
      setResultSuccess(null);
      return;
    }

    try {
      setResultSaving(true);
      setResultError(null);
      setResultSuccess(null);
      await onUpdateMatchResult(selectedMatchId, { teamAScore, teamBScore });
      setResultSuccess(
        'Resultat enregistre et envoye aux responsables des deux equipes.',
      );
    } catch (error) {
      setResultError(
        error instanceof Error
          ? error.message
          : "Impossible d'encoder le resultat",
      );
    } finally {
      setResultSaving(false);
    }
  };

  const handleRespondToResult = async (
    action: 'CONFIRM' | 'CORRECT' | 'REFUSE',
  ) => {
    if (!selectedMatchId) {
      return;
    }

    try {
      setResultSaving(true);
      setResultError(null);
      setResultSuccess(null);

      if (action === 'CORRECT') {
        const draft = resultDrafts[selectedMatchId];
        const teamAScore = Number(draft?.teamAScore);
        const teamBScore = Number(draft?.teamBScore);
        if (
          !draft ||
          draft.teamAScore === '' ||
          draft.teamBScore === '' ||
          Number.isNaN(teamAScore) ||
          Number.isNaN(teamBScore) ||
          teamAScore < 0 ||
          teamBScore < 0
        ) {
          setResultError(
            'Renseigne un score corrige valide pour les deux equipes.',
          );
          setResultSuccess(null);
          return;
        }

        await onRespondToMatchResult(selectedMatchId, {
          action,
          teamAScore,
          teamBScore,
        });
        setResultSuccess('Correction envoyee aux deux equipes.');
      } else {
        await onRespondToMatchResult(selectedMatchId, { action });
        setResultSuccess(
          action === 'CONFIRM'
            ? 'Resultat confirme.'
            : 'Refus du resultat enregistre.',
        );
      }
    } catch (error) {
      setResultError(
        error instanceof Error
          ? error.message
          : 'Impossible de repondre au resultat',
      );
    } finally {
      setResultSaving(false);
    }
  };

  const handleDeclareForfeit = async () => {
    if (!selectedMatchId) {
      return;
    }

    const confirmed = window.confirm(
      "Declarer forfait pour ce match ? L'equipe adverse gagnera 5-0.",
    );
    if (!confirmed) {
      return;
    }

    try {
      setForfeitSaving(true);
      setResultError(null);
      setResultSuccess(null);
      await onDeclareMatchForfeit(selectedMatchId);
      setResultSuccess("Forfait declare. L'equipe adverse gagne 5-0.");
    } catch (error) {
      setResultError(
        error instanceof Error
          ? error.message
          : 'Impossible de declarer forfait',
      );
    } finally {
      setForfeitSaving(false);
    }
  };

  const roundOrder: Record<string, number> = {
    PREMIER_TOUR: 0,
    ROUND_OF_128: 1,
    ROUND_OF_64: 2,
    ROUND_OF_32: 3,
    ROUND_OF_16: 4,
    QUARTER_FINAL: 5,
    SEMI_FINAL: 6,
    FINAL: 7,
  };

  const sortedMatches = [...matches].sort((a, b) => {
    const orderA = roundOrder[a.round] ?? 8;
    const orderB = roundOrder[b.round] ?? 8;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.id - b.id;
  });

  const matchesByRound = sortedMatches.reduce<
    Record<string, TournamentMatchResponse[]>
  >((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {});

  const roundEntries = Object.entries(matchesByRound).sort((a, b) => {
    const orderA = roundOrder[a[0]] ?? 8;
    const orderB = roundOrder[b[0]] ?? 8;
    return orderA - orderB;
  });
  const firstRoundOrder =
    roundEntries.length > 0 ? (roundOrder[roundEntries[0][0]] ?? 8) : 8;
  const matchIndexesById = new Map<number, number>();
  roundEntries.forEach(([, roundMatches]) => {
    roundMatches.forEach((match, index) => {
      matchIndexesById.set(match.id, index);
    });
  });

  const findPreviousRoundMatches = (match: TournamentMatchResponse) => {
    const currentOrder = roundOrder[match.round] ?? 8;
    const previousEntries = roundEntries.filter(
      ([round]) => (roundOrder[round] ?? 8) < currentOrder,
    );
    const previousEntry = previousEntries[previousEntries.length - 1];
    return previousEntry?.[1] ?? [];
  };

  const getPreviousMatchForSlot = (
    match: TournamentMatchResponse,
    side: 'A' | 'B',
  ) => {
    const previousRoundMatches = findPreviousRoundMatches(match);
    const matchIndex = matchIndexesById.get(match.id) ?? 0;
    return previousRoundMatches[matchIndex * 2 + (side === 'A' ? 0 : 1)];
  };

  const isPendingTeamSlot = (
    match: TournamentMatchResponse,
    side: 'A' | 'B',
  ) => {
    const currentOrder = roundOrder[match.round] ?? 8;
    if (
      currentOrder <= firstRoundOrder ||
      match.resultStatus !== 'NOT_ENCODED'
    ) {
      return false;
    }

    const previousMatch = getPreviousMatchForSlot(match, side);
    return previousMatch != null && !previousMatch.isBye;
  };

  const getDisplayTeamName = (
    match: TournamentMatchResponse,
    side: 'A' | 'B',
  ) => {
    const fallback =
      side === 'A' ? 'Equipe A' : match.isBye ? 'Bye' : 'Equipe B';
    const realName = side === 'A' ? match.teamAName : match.teamBName;
    const previousMatch = getPreviousMatchForSlot(match, side);

    if (isPendingTeamSlot(match, side) && previousMatch) {
      return `Vainqueur ${getRoundLabel(previousMatch.round).toLowerCase()} #${
        previousMatch.id
      }`;
    }

    return realName || fallback;
  };

  const selectedMatch =
    selectedMatchId != null
      ? (matches.find((match) => match.id === selectedMatchId) ?? null)
      : null;
  const selectedMatchHasPendingTeams =
    selectedMatch != null &&
    (isPendingTeamSlot(selectedMatch, 'A') ||
      isPendingTeamSlot(selectedMatch, 'B'));
  const selectedTeamAName = selectedMatch
    ? getDisplayTeamName(selectedMatch, 'A')
    : 'Equipe A';
  const selectedTeamBName = selectedMatch
    ? getDisplayTeamName(selectedMatch, 'B')
    : 'Equipe B';
  const nowTimestamp = Date.now();
  const selectedMatchDisplayScore =
    selectedMatch != null
      ? getDisplayScoreForMatch(selectedMatch, nowTimestamp)
      : null;
  const selectedDraft =
    selectedMatchId != null ? drafts[selectedMatchId] : undefined;
  const selectedSelectionDraft =
    selectedMatchId != null ? selectionDrafts[selectedMatchId] : undefined;
  const selectedResultDraft =
    selectedMatchId != null ? resultDrafts[selectedMatchId] : undefined;
  const isEditable = isAdmin && selectedMatch?.status === 'PLANNED';
  const canEditFields = isEditable && isEditing;
  const canEncodeResult =
    isAdmin &&
    selectedMatch != null &&
    !selectedMatchHasPendingTeams &&
    selectedMatch.status !== 'PLANNED' &&
    !selectedMatch.isBye &&
    selectedMatch.scheduledDate != null &&
    new Date(selectedMatch.scheduledDate).getTime() <= Date.now();
  const canEditSelection =
    selectedMatch != null &&
    !selectedMatchHasPendingTeams &&
    selectedMatch.status === 'PUBLISHED' &&
    viewerTeamId != null &&
    (selectedMatch.teamAId === viewerTeamId ||
      selectedMatch.teamBId === viewerTeamId) &&
    (viewerRole === 'RESPONSIBLE' || viewerRole === 'ADMIN') &&
    selectedMatch.scheduledDate != null &&
    new Date(selectedMatch.scheduledDate).getTime() > Date.now();

  const selectedTeamIdForViewer =
    selectedMatch && viewerTeamId != null
      ? selectedMatch.teamAId === viewerTeamId
        ? selectedMatch.teamAId
        : selectedMatch.teamBId === viewerTeamId
          ? selectedMatch.teamBId
          : null
      : null;
  const canRespondToResult =
    selectedMatch != null &&
    !selectedMatchHasPendingTeams &&
    (viewerRole === 'RESPONSIBLE' || viewerRole === 'ADMIN') &&
    viewerTeamId != null &&
    (selectedMatch.teamAId === viewerTeamId ||
      selectedMatch.teamBId === viewerTeamId) &&
    selectedMatch.teamBId != null &&
    selectedMatch.resultStatus !== 'NOT_ENCODED' &&
    selectedMatch.resultStatus !== 'CONFIRMED';
  const canDeclareForfeit =
    selectedMatch != null &&
    !selectedMatchHasPendingTeams &&
    selectedMatch.status === 'PUBLISHED' &&
    !selectedMatch.isBye &&
    selectedMatch.teamBId != null &&
    selectedMatch.resultStatus === 'NOT_ENCODED' &&
    viewerTeamId != null &&
    (selectedMatch.teamAId === viewerTeamId ||
      selectedMatch.teamBId === viewerTeamId) &&
    (viewerRole === 'RESPONSIBLE' || viewerRole === 'ADMIN') &&
    selectedMatch.scheduledDate != null &&
    new Date(selectedMatch.scheduledDate).getTime() > Date.now();
  const selectablePlayers =
    selectedTeamIdForViewer != null
      ? (teamMembersByTeamId[selectedTeamIdForViewer] ?? [])
      : [];
  const selectedTeamA = selectedMatch?.selectionForTeamA ?? [];
  const selectedTeamB = selectedMatch?.selectionForTeamB ?? [];
  const hasPlanning = matches.length > 0;
  const canShowGenerate = isAdmin;
  const canGenerateNow = isAdmin && canGeneratePlanning && !hasPlanning;
  const showGeneratePermissionMessage =
    !isAdmin && canGeneratePlanning && !hasPlanning;
  const selectedMatchDetails = selectedMatch ? (
    <Stack
      spacing={1.5}
      onClick={(event) => event.stopPropagation()}
      sx={{
        mt: 1.5,
        pt: 1.5,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {isEditing && (
        <Paper
          variant="outlined"
          sx={{
            ...teamPaperSx,
            p: 1.75,
            height: 'auto',
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography
                variant="overline"
                sx={{ color: 'rgba(240, 230, 210, 0.7)' }}
              >
                Modification
              </Typography>
              <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
                Modifier le match selectionne
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {selectedDraft && (
              <Stack spacing={1.5}>
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(240, 230, 210, 0.7)' }}
                >
                  {getRoundLabel(selectedMatch.round)} - Match #
                  {selectedMatch.id}
                </Typography>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="planning-team-a-label">Equipe A</InputLabel>
                    <Select
                      id="planning-team-a-select"
                      labelId="planning-team-a-label"
                      label="Equipe A"
                      value={selectedDraft.teamAId}
                      onChange={(event) =>
                        handleDraftChange(
                          selectedMatch.id,
                          'teamAId',
                          event.target.value,
                        )
                      }
                      disabled={!canEditFields}
                    >
                      {teamOptions.map((team) => (
                        <MenuItem key={team.id} value={String(team.id)}>
                          {team.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="planning-team-b-label">Equipe B</InputLabel>
                    <Select
                      id="planning-team-b-select"
                      labelId="planning-team-b-label"
                      label="Equipe B"
                      value={selectedDraft.teamBId}
                      onChange={(event) =>
                        handleDraftChange(
                          selectedMatch.id,
                          'teamBId',
                          event.target.value,
                        )
                      }
                      disabled={!canEditFields || selectedMatch.isBye}
                    >
                      <MenuItem value="">Aucune</MenuItem>
                      {teamOptions.map((team) => (
                        <MenuItem key={team.id} value={String(team.id)}>
                          {team.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                  <TextField
                    type="datetime-local"
                    label="Date du match"
                    value={selectedDraft.scheduledDate}
                    onChange={(event) =>
                      handleDraftChange(
                        selectedMatch.id,
                        'scheduledDate',
                        event.target.value,
                      )
                    }
                    size="small"
                    fullWidth
                    disabled={!canEditFields}
                    InputLabelProps={{ shrink: true }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={!isEditing || savingMatchId === selectedMatch.id}
                    sx={{
                      minWidth: 150,
                      fontWeight: 700,
                      background:
                        'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
                      color: '#111827',
                      boxShadow: '0 10px 24px rgba(200, 170, 110, 0.28)',
                    }}
                  >
                    {savingMatchId === selectedMatch.id
                      ? 'Sauvegarde...'
                      : 'Sauvegarder'}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Paper>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            ...teamPaperSx,
            p: 1.75,
            height: 'auto',
          }}
        >
          <Stack spacing={1.25}>
            <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
              Compositions d'équipe
            </Typography>
            <Typography sx={{ color: 'rgba(240, 230, 210, 0.72)' }}>
              Match prevu le{' '}
              {formatScheduledDateTime(selectedMatch.scheduledDate)}
            </Typography>

            <Stack spacing={0.9}>
              <Typography sx={{ color: 'rgba(240, 230, 210, 0.75)' }}>
                {selectedTeamAName} ({selectedTeamA.length}/4)
              </Typography>
              {selectedTeamA.length === 0 ? (
                <Typography sx={{ color: 'rgba(240, 230, 210, 0.55)' }}>
                  Aucune sélection visible.
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectedTeamA.map((player) => (
                    <Chip key={player.id} label={player.tag} />
                  ))}
                </Stack>
              )}
            </Stack>

            {selectedMatch.teamBId && (
              <Stack spacing={0.9}>
                <Typography sx={{ color: 'rgba(240, 230, 210, 0.75)' }}>
                  {selectedTeamBName} ({selectedTeamB.length}/4)
                </Typography>
                {selectedTeamB.length === 0 ? (
                  <Typography sx={{ color: 'rgba(240, 230, 210, 0.55)' }}>
                    Aucune sélection visible.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedTeamB.map((player) => (
                      <Chip key={player.id} label={player.tag} />
                    ))}
                  </Stack>
                )}
              </Stack>
            )}

            {canEditSelection && (
              <Stack spacing={1.25}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
                  Ma sélection (1 à 4 joueurs)
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {selectablePlayers.map((player) => {
                    const selected =
                      selectedSelectionDraft?.playerIds.includes(player.id) ??
                      false;
                    return (
                      <Chip
                        key={player.id}
                        label={player.tag}
                        clickable
                        color={selected ? 'primary' : 'default'}
                        onClick={() =>
                          handleSelectionToggle(selectedMatch.id, player.id)
                        }
                      />
                    );
                  })}
                </Stack>
                <Typography sx={{ color: 'rgba(240, 230, 210, 0.7)' }}>
                  {selectedSelectionDraft?.playerIds.length ?? 0}/4 sélectionnés
                </Typography>
                <Button
                  variant="contained"
                  disabled={
                    selectionSaving ||
                    (selectedSelectionDraft?.playerIds.length ?? 0) < 1 ||
                    (selectedSelectionDraft?.playerIds.length ?? 0) > 4
                  }
                  onClick={handleSaveSelection}
                  sx={{
                    alignSelf: 'flex-start',
                    fontWeight: 700,
                    background:
                      'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
                    color: '#111827',
                    boxShadow: '0 10px 24px rgba(200, 170, 110, 0.28)',
                  }}
                >
                  {selectionSaving
                    ? 'Sauvegarde...'
                    : 'Sauvegarder la sélection'}
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            ...teamPaperSx,
            p: 1.75,
            height: 'auto',
          }}
        >
          <Stack spacing={1.25}>
            <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
              Resultat du match
            </Typography>

            {selectedMatchDisplayScore ? (
              <Stack spacing={1.25}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: '#fff6de', fontWeight: 800 }}
                >
                  {`${selectedTeamAName} ${selectedMatchDisplayScore.teamAScore} - ${selectedMatchDisplayScore.teamBScore} ${selectedTeamBName}`}
                </Typography>
                <Chip
                  size="small"
                  label={
                    selectedMatchDisplayScore.isSynthetic
                      ? 'Score simule'
                      : getResultStatusLabel(selectedMatch.resultStatus)
                  }
                  sx={{
                    width: 'fit-content',
                    bgcolor: 'rgba(200, 170, 110, 0.16)',
                    color: '#fff6de',
                    fontWeight: 700,
                  }}
                />
                {selectedMatchDisplayScore.isSynthetic ? (
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(240, 230, 210, 0.72)' }}
                  >
                    Score genere automatiquement pour rendre les matchs passes
                    plus realistes.
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap">
                    <Chip
                      size="small"
                      label={`${selectedTeamAName}: ${getTeamResponseLabel(
                        selectedMatch.teamAResultResponse,
                      )}`}
                    />
                    <Chip
                      size="small"
                      label={`${selectedTeamBName}: ${getTeamResponseLabel(
                        selectedMatch.teamBResultResponse,
                      )}`}
                    />
                  </Stack>
                )}
              </Stack>
            ) : (
              <Alert severity="info">
                Aucun resultat n'a encore ete encode pour ce match.
              </Alert>
            )}

            {canDeclareForfeit && (
              <Stack spacing={1.25}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
                  Forfait
                </Typography>
                <Typography sx={{ color: 'rgba(240, 230, 210, 0.72)' }}>
                  Votre equipe peut declarer forfait avant la date du match.
                  L'equipe adverse gagnera 5-0.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={forfeitSaving || resultSaving}
                  onClick={() => void handleDeclareForfeit()}
                  sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
                >
                  {forfeitSaving ? 'Declaration...' : 'Declarer forfait'}
                </Button>
              </Stack>
            )}

            {canEncodeResult && selectedResultDraft && (
              <Stack spacing={1.25}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
                  Encodage administrateur
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    type="number"
                    label={selectedTeamAName}
                    value={selectedResultDraft.teamAScore}
                    onChange={(event) =>
                      handleResultDraftChange(
                        selectedMatch.id,
                        'teamAScore',
                        event.target.value,
                      )
                    }
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    type="number"
                    label={selectedTeamBName}
                    value={selectedResultDraft.teamBScore}
                    onChange={(event) =>
                      handleResultDraftChange(
                        selectedMatch.id,
                        'teamBScore',
                        event.target.value,
                      )
                    }
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Stack>
                <Button
                  variant="contained"
                  onClick={handleSaveResult}
                  disabled={resultSaving}
                  sx={{
                    alignSelf: 'flex-start',
                    fontWeight: 700,
                    background:
                      'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
                    color: '#111827',
                    boxShadow: '0 10px 24px rgba(200, 170, 110, 0.28)',
                  }}
                >
                  {resultSaving ? 'Enregistrement...' : 'Encoder le resultat'}
                </Button>
              </Stack>
            )}

            {canRespondToResult && selectedResultDraft && (
              <Stack spacing={1.25}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
                <Typography sx={{ color: '#f0e6d2', fontWeight: 700 }}>
                  Reponse des responsables
                </Typography>
                <Typography sx={{ color: 'rgba(240, 230, 210, 0.72)' }}>
                  Suite a la notification recue, vous pouvez confirmer, corriger
                  ou refuser ce resultat.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    type="number"
                    label={selectedTeamAName}
                    value={selectedResultDraft.teamAScore}
                    onChange={(event) =>
                      handleResultDraftChange(
                        selectedMatch.id,
                        'teamAScore',
                        event.target.value,
                      )
                    }
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    type="number"
                    label={selectedTeamBName}
                    value={selectedResultDraft.teamBScore}
                    onChange={(event) =>
                      handleResultDraftChange(
                        selectedMatch.id,
                        'teamBScore',
                        event.target.value,
                      )
                    }
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.75}>
                  <Button
                    variant="contained"
                    disabled={resultSaving}
                    onClick={() => void handleRespondToResult('CONFIRM')}
                    sx={{
                      fontWeight: 700,
                      background:
                        'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
                      color: '#111827',
                    }}
                  >
                    Confirmer
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={resultSaving}
                    onClick={() => void handleRespondToResult('CORRECT')}
                    sx={{
                      color: '#f0e6d2',
                      borderColor: 'rgba(255, 255, 255, 0.18)',
                    }}
                  >
                    Corriger
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={resultSaving}
                    onClick={() => void handleRespondToResult('REFUSE')}
                  >
                    Refuser
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Box>
    </Stack>
  ) : null;

  return (
    <Card
      variant="outlined"
      sx={{ ...rosterCardSx, height: 'auto', overflow: 'visible' }}
    >
      <CardContent
        sx={{
          position: 'relative',
          zIndex: 1,
          height: 'auto',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <Stack sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }} spacing={2.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: '#c8aa6e', letterSpacing: 1.2 }}
              >
                Phase finale
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: '#f0e6d2', fontWeight: 700 }}
              >
                Planning des matchs
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${matches.length} match${matches.length > 1 ? 's' : ''}`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#f0e6d2',
                  fontWeight: 700,
                }}
              />
              <Button
                variant="outlined"
                onClick={onRefreshMatches}
                sx={{
                  color: '#f0e6d2',
                  borderColor: 'rgba(255, 255, 255, 0.18)',
                }}
              >
                Actualiser
              </Button>
              {isAdmin && (
                <Button
                  variant="contained"
                  onClick={onPublishPlanning}
                  disabled={publishLoading || matches.length === 0}
                  sx={{
                    fontWeight: 700,
                    background:
                      'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
                    color: '#111827',
                    boxShadow: '0 10px 24px rgba(200, 170, 110, 0.28)',
                  }}
                >
                  {publishLoading ? 'Publication...' : 'Publier'}
                </Button>
              )}
            </Stack>
          </Stack>

          {canShowGenerate && (
            <Box>
              <Stack spacing={0.75} alignItems="flex-start">
                <Button
                  variant="contained"
                  onClick={onGeneratePlanning}
                  disabled={!canGenerateNow || planningLoading}
                  sx={{
                    minWidth: 240,
                    py: 1.1,
                    fontWeight: 700,
                    background:
                      'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
                    color: '#111827',
                    boxShadow: '0 10px 24px rgba(200, 170, 110, 0.28)',
                  }}
                >
                  {planningLoading
                    ? 'Generation en cours...'
                    : hasPlanning
                      ? 'Planning deja genere'
                      : 'Generer le planning'}
                </Button>
                {!canGeneratePlanning && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'rgba(240, 230, 210, 0.7)' }}
                  >
                    La generation est possible apres la date limite
                    d'inscription.
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          {showGeneratePermissionMessage && (
            <Alert severity="warning">
              Seul un admin peut generer le planning de ce tournoi.
            </Alert>
          )}

          {matchesLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {matchesError && <Alert severity="error">{matchesError}</Alert>}
          {updateError && <Alert severity="error">{updateError}</Alert>}
          {updateSuccess && <Alert severity="success">{updateSuccess}</Alert>}
          {selectionError && <Alert severity="error">{selectionError}</Alert>}
          {selectionSuccess && (
            <Alert severity="success">{selectionSuccess}</Alert>
          )}
          {resultError && <Alert severity="error">{resultError}</Alert>}
          {resultSuccess && <Alert severity="success">{resultSuccess}</Alert>}

          {!matchesLoading && matches.length === 0 && (
            <Alert severity="info">
              Aucun match pour l'instant. Genere le planning une fois les
              inscriptions terminees.
            </Alert>
          )}

          {!matchesLoading && matches.length > 0 && (
            <Stack spacing={2.5}>
              {tournament.winnerTeamName && (
                <Box>
                  <Chip
                    label={`Gagnant : ${tournament.winnerTeamName}`}
                    sx={{
                      bgcolor: 'rgba(200, 170, 110, 0.16)',
                      color: '#fff6de',
                      borderColor: 'rgba(200, 170, 110, 0.35)',
                      fontWeight: 700,
                    }}
                  />
                </Box>
              )}
              {isEditable && (
                <Box>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing((prev) => !prev)}
                    sx={{
                      color: '#f0e6d2',
                      borderColor: 'rgba(255, 255, 255, 0.18)',
                    }}
                  >
                    {isEditing
                      ? 'Fermer la modification'
                      : 'Modifier le planning'}
                  </Button>
                </Box>
              )}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    xl: '1fr',
                  },
                  gap: 2,
                  alignItems: 'start',
                }}
              >
                <Box
                  sx={{
                    overflowY: { xs: 'visible', xl: 'auto' },
                    maxHeight: { xs: 'none', xl: 'calc(100vh - 190px)' },
                    pr: { xl: 0.5 },
                    '&::-webkit-scrollbar': { width: 8 },
                    '&::-webkit-scrollbar-thumb': {
                      background: 'rgba(196, 125, 255, 0.45)',
                      borderRadius: 999,
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(255, 255, 255, 0.06)',
                    },
                  }}
                >
                  <Stack spacing={2}>
                    {roundEntries.map(([round, roundMatches]) => (
                      <Paper
                        key={round}
                        variant="outlined"
                        sx={{
                          ...teamPaperSx,
                          p: 1.75,
                          height: 'auto',
                        }}
                      >
                        <Stack spacing={1.25}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            <Typography
                              sx={{
                                color: '#f0e6d2',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                              }}
                            >
                              {getRoundLabel(round)}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${roundMatches.length} match${
                                roundMatches.length > 1 ? 's' : ''
                              }`}
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.08)',
                                color: '#f0e6d2',
                                fontWeight: 700,
                              }}
                            />
                          </Stack>

                          <Stack spacing={1}>
                            {roundMatches.map((match) => {
                              const isSelected = match.id === selectedMatchId;
                              const matchDisplayScore = getDisplayScoreForMatch(
                                match,
                                nowTimestamp,
                              );
                              return (
                                <Paper
                                  key={match.id}
                                  variant="outlined"
                                  onClick={() => setSelectedMatchId(match.id)}
                                  sx={{
                                    p: 1.5,
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    borderColor: isSelected
                                      ? 'rgba(200, 170, 110, 0.85)'
                                      : 'rgba(255, 255, 255, 0.12)',
                                    background: isSelected
                                      ? 'linear-gradient(135deg, rgba(45, 52, 65, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
                                      : 'rgba(10, 16, 28, 0.72)',
                                    boxShadow: isSelected
                                      ? '0 0 18px rgba(200, 170, 110, 0.28)'
                                      : 'none',
                                  }}
                                >
                                  <Stack
                                    direction={{
                                      xs: 'column',
                                      md: 'row',
                                    }}
                                    justifyContent="space-between"
                                    alignItems={{
                                      xs: 'flex-start',
                                      md: 'center',
                                    }}
                                    spacing={1.25}
                                  >
                                    <Box sx={{ minWidth: 0 }}>
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        flexWrap="wrap"
                                      >
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: 'rgba(240, 230, 210, 0.68)',
                                            fontWeight: 700,
                                          }}
                                        >
                                          Match #{match.id}
                                        </Typography>
                                        <Chip
                                          size="small"
                                          label={match.status}
                                          sx={{
                                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                                            color: '#f0e6d2',
                                            fontWeight: 700,
                                          }}
                                        />
                                      </Stack>
                                      <Typography
                                        sx={{
                                          color: '#f8fafc',
                                          fontWeight: 800,
                                          mt: 0.75,
                                          overflowWrap: 'anywhere',
                                        }}
                                      >
                                        {getDisplayTeamName(match, 'A')} vs{' '}
                                        {getDisplayTeamName(match, 'B')}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: 'rgba(240, 230, 210, 0.68)',
                                        }}
                                      >
                                        {formatScheduledDateTime(
                                          match.scheduledDate,
                                        )}
                                      </Typography>
                                    </Box>

                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                      flexWrap="wrap"
                                      justifyContent={{
                                        xs: 'flex-start',
                                        md: 'flex-end',
                                      }}
                                    >
                                      {matchDisplayScore && (
                                        <Chip
                                          label={`${matchDisplayScore.teamAScore} - ${matchDisplayScore.teamBScore}`}
                                          sx={{
                                            bgcolor:
                                              'rgba(200, 170, 110, 0.16)',
                                            color: '#fff6de',
                                            fontWeight: 800,
                                          }}
                                        />
                                      )}
                                      <Button
                                        size="small"
                                        variant={
                                          isSelected ? 'contained' : 'outlined'
                                        }
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setSelectedMatchId(match.id);
                                        }}
                                        sx={{
                                          fontWeight: 700,
                                          ...(isSelected
                                            ? {
                                                background:
                                                  'linear-gradient(135deg, #c8aa6e 0%, #e0c889 100%)',
                                                color: '#111827',
                                              }
                                            : {
                                                color: '#f0e6d2',
                                                borderColor:
                                                  'rgba(255, 255, 255, 0.18)',
                                              }),
                                        }}
                                      >
                                        Details
                                      </Button>
                                    </Stack>
                                  </Stack>
                                  {isSelected && selectedMatchDetails}
                                </Paper>
                              );
                            })}
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Box>

              {!isEditable && (
                <Alert severity="info">
                  Le planning est publie : les matchs ne sont plus modifiables.
                </Alert>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TournamentPlanningSection;
