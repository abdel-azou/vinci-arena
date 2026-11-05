import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Container, Grid, Typography } from '@mui/material';
import { MemberContext } from '../../contexts/UserContext';
import { MemberContextType } from '../../types';
import {
  createTournament,
  getMyDraftTournaments,
  TournamentResponse,
  updateTournament,
  publishTournament,
} from '../../services/tournamentService';
import CreateTournamentDraftForm from './CreateTournamentDraftForm';
import CreateTournamentDraftList from './CreateTournamentDraftList';
import CreateTournamentSelectedDraft from './CreateTournamentSelectedDraft';
import {
  emptyFormData,
  formatDate,
  getMinimumSelectableDate,
  getTournamentPayload,
  TournamentFormData,
  validateTournamentForm,
} from './CreateTournamentPage.utils';

const CreateTournamentPage = () => {
  const { authenticatedMember } = useContext<MemberContextType>(MemberContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TournamentFormData>(emptyFormData);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [drafts, setDrafts] = useState<TournamentResponse[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [draftsError, setDraftsError] = useState<string | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<number | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null);
  const [minimumDate] = useState(getMinimumSelectableDate);
  const selectedDraft = useMemo(
    () => drafts.find((draft) => draft.id === selectedDraftId) ?? null,
    [drafts, selectedDraftId],
  );

  const loadDrafts = useCallback(async () => {
    setDraftsLoading(true);
    setDraftsError(null);

    try {
      const loadedDrafts = await getMyDraftTournaments();
      setDrafts(loadedDrafts);
      setSelectedDraftId((current) => {
        if (current && loadedDrafts.some((draft) => draft.id === current)) {
          return current;
        }
        return loadedDrafts[0]?.id ?? null;
      });
    } catch (draftError) {
      setDraftsError(
        draftError instanceof Error
          ? draftError.message
          : 'Impossible de charger les brouillons',
      );
    } finally {
      setDraftsLoading(false);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingDraftId(null);
  };

  const fillFormFromDraft = (draft: TournamentResponse) => {
    setFormData({
      name: draft.name,
      description: draft.description,
      startDate: draft.startDate.slice(0, 10),
      endDate: draft.endDate.slice(0, 10),
      registrationDeadline: draft.registrationDeadline.slice(0, 10),
      maxTeams: String(draft.maxTeams),
    });
    setEditingDraftId(draft.id);
    setSelectedDraftId(draft.id);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const validationError = validateTournamentForm(formData, minimumDate);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = getTournamentPayload(formData);

      const savedTournament = editingDraftId
        ? await updateTournament(editingDraftId, payload)
        : await createTournament(payload);

      setDrafts((currentDrafts) => [
        savedTournament,
        ...currentDrafts.filter((draft) => draft.id !== savedTournament.id),
      ]);
      setSelectedDraftId(savedTournament.id);
      setSuccessMessage(
        editingDraftId
          ? 'Brouillon mis à jour avec succès.'
          : 'Brouillon enregistré avec succès.',
      );
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingDraftId
            ? 'Erreur lors de la modification du brouillon'
            : 'Erreur lors de la création du tournoi',
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!selectedDraft) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setPublishing(true);

    try {
      await publishTournament(selectedDraft.id);
      setDrafts((currentDrafts) => {
        const remainingDrafts = currentDrafts.filter(
          (draft) => draft.id !== selectedDraft.id,
        );
        setSelectedDraftId(remainingDrafts[0]?.id ?? null);
        return remainingDrafts;
      });
      if (editingDraftId === selectedDraft.id) {
        resetForm();
      }
      setSuccessMessage('Tournoi publié avec succès.');
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : 'Erreur lors de la publication du tournoi',
      );
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (!authenticatedMember) {
      navigate('/login');
      return;
    }

    if (authenticatedMember.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    void loadDrafts();
  }, [authenticatedMember, navigate, loadDrafts]);

  if (!authenticatedMember || authenticatedMember.role !== 'ADMIN') {
    return null;
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mt: 4,
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          background:
            'linear-gradient(180deg, rgba(10, 20, 40, 0.9) 0%, rgba(1, 10, 19, 0.9) 100%)',
          border: '1px solid rgba(200, 170, 110, 0.3)',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: 'linear-gradient(180deg, #f0e6d2 0%, #c8aa6e 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          Créer un tournoi
        </Typography>

        <Typography
          sx={{
            textAlign: 'center',
            color: '#a09b8c',
            letterSpacing: '0.03em',
            mb: 1,
          }}
        >
          Préparez un nouveau tournoi pour l&apos;arène.
        </Typography>

        <Typography
          sx={{
            textAlign: 'center',
            color: 'rgba(240, 230, 210, 0.6)',
            mb: 4,
          }}
        >
          Les horaires sont fixés automatiquement. Vous choisissez uniquement
          les dates.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {editingDraftId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Vous modifiez le brouillon sélectionné. Enregistrez pour conserver
            vos changements, ou annulez pour revenir à un nouveau brouillon.
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Colonne gauche : Formulaire (prend 50% sur desktop, 100% sur mobile) */}
          <Grid item xs={12} md={selectedDraft ? 6 : 12}>
            <CreateTournamentDraftForm
              editingDraftId={editingDraftId}
              formData={formData}
              loading={loading}
              minimumDate={minimumDate}
              onChange={handleChange}
              onReset={resetForm}
              onSubmit={handleSubmit}
              publishing={publishing}
            />
          </Grid>

          {/* Colonne droite : Brouillon sélectionné (prend 50% sur desktop) */}
          {selectedDraft && (
            <Grid item xs={12} md={6}>
              <CreateTournamentSelectedDraft
                formatDate={formatDate}
                loading={loading}
                onEdit={() => fillFormFromDraft(selectedDraft)}
                onPublish={handlePublishDraft}
                publishing={publishing}
                selectedDraft={selectedDraft}
              />
            </Grid>
          )}
        </Grid>

        {/* Liste des brouillons en bas */}
        <CreateTournamentDraftList
          drafts={drafts}
          draftsError={draftsError}
          draftsLoading={draftsLoading}
          formatDate={formatDate}
          onSelectDraft={setSelectedDraftId}
          selectedDraftId={selectedDraftId}
        />
      </Box>
    </Container>
  );
};

export default CreateTournamentPage;
