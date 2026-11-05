import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { MemberContext } from '../../contexts/UserContext';
import {
  MemberContextType,
  MemberUnavailability,
  PublicMemberTournament,
  Specialty,
} from '../../types';
import { getTeams } from '../../services/teamService';
import { getPublicMemberProfile } from '../../services/memberService';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ProfileAvatarSection from './ProfileAvatarSection';
import ProfileAvailabilitySection from './ProfileAvailabilitySection';
import ProfileOverviewSection from './ProfileOverviewSection';
import ProfileSectionNavigation from './ProfileSectionNavigation';
import ProfileSecuritySection from './ProfileSecuritySection';
import ProfileSummaryCard from './ProfileSummaryCard';
import {
  formatDateForInput,
  hasOverlappingUnavailability,
  ProfileSection,
} from './ProfilePage.utils';

const ProfilePage = () => {
  const {
    authenticatedMember,
    changePassword,
    updateSpecialty,
    updateProfileImage,
    getMyUnavailabilities,
    createUnavailability,
    deleteUnavailability,
  } = useContext<MemberContextType>(MemberContext);
  const navigate = useNavigate();

  const avatars = Array.from(
    { length: 20 },
    (_, index) => `Avatar${index + 1}.png`,
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [editingSpecialty, setEditingSpecialty] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState<Specialty | ''>('');
  const [specialtyLoading, setSpecialtyLoading] = useState(false);
  const [specialtySuccessMessage, setSpecialtySuccessMessage] = useState('');
  const [specialtyErrorMessage, setSpecialtyErrorMessage] = useState('');

  const [editingAvatar, setEditingAvatar] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState('');
  const [avatarErrorMessage, setAvatarErrorMessage] = useState('');

  const [unavailabilities, setUnavailabilities] = useState<
    MemberUnavailability[]
  >([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unavailabilityErrorMessage, setUnavailabilityErrorMessage] =
    useState('');
  const [teamName, setTeamName] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<PublicMemberTournament[]>([]);
  const [activeSection, setActiveSection] =
    useState<ProfileSection>('overview');
  const today = formatDateForInput(new Date());

  useEffect(() => {
    if (!authenticatedMember) {
      navigate('/login');
      return;
    }

    const load = async () => {
      try {
        const list = await getMyUnavailabilities();
        setUnavailabilities(list);
      } catch (e) {
        console.error(e);
      }
    };

    const loadTeam = async () => {
      if (!authenticatedMember.teamId) {
        setTeamName(null);
        return;
      }

      try {
        const teams = await getTeams(authenticatedMember.token);
        const currentTeam = teams.find(
          (team) => team.id === authenticatedMember.teamId,
        );
        setTeamName(currentTeam?.nom ?? null);
      } catch (e) {
        console.error(e);
        setTeamName(null);
      }
    };

    const loadMyTournaments = async () => {
      if (!authenticatedMember.id) {
        setTournaments([]);
        return;
      }

      try {
        const profile = await getPublicMemberProfile(
          authenticatedMember.id,
          authenticatedMember.token,
        );
        setTournaments(profile.tournaments ?? []);
      } catch (e) {
        console.error(e);
        setTournaments([]);
      }
    };

    void load();
    void loadTeam();
    void loadMyTournaments();
  }, [authenticatedMember, getMyUnavailabilities, navigate]);

  const handleAddUnavailability = async () => {
    setUnavailabilityErrorMessage('');
    if (!startDate || !endDate) {
      setUnavailabilityErrorMessage(
        'Les dates de debut et de fin sont obligatoires',
      );
      return;
    }

    if (endDate < startDate) {
      setUnavailabilityErrorMessage(
        'La date de fin ne peut pas etre plus petite que la date de debut',
      );
      return;
    }

    if (startDate < today || endDate < today) {
      setUnavailabilityErrorMessage(
        "Les dates d'indisponibilité ne peuvent pas être antérieures à aujourd'hui",
      );
      return;
    }

    if (hasOverlappingUnavailability(unavailabilities, startDate, endDate)) {
      setUnavailabilityErrorMessage(
        'Tu as deja une indisponibilite sur cette periode',
      );
      return;
    }

    try {
      const created = await createUnavailability(startDate, endDate);
      setUnavailabilities([...unavailabilities, created]);
      setStartDate('');
      setEndDate('');
    } catch (e) {
      setUnavailabilityErrorMessage(
        e instanceof Error ? e.message : "Erreur lors de l'ajout",
      );
    }
  };

  const handleDeleteUnavailability = async (id: number) => {
    try {
      await deleteUnavailability(id);
      setUnavailabilities(unavailabilities.filter((u) => u.id !== id));
    } catch {
      setUnavailabilityErrorMessage('Erreur lors de la suppression');
    }
  };

  const handleChangePassword = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMessage('Tous les champs sont obligatoires');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMessage(
        "Le nouveau mot de passe doit être différent de l'actuel",
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('La confirmation ne correspond pas');
      return;
    }

    try {
      setLoading(true);
      await changePassword({ currentPassword, newPassword });
      setSuccessMessage('Mot de passe mis à jour');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du changement de mot de passe';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSpecialty = () => {
    setNewSpecialty(authenticatedMember?.specialty || '');
    setEditingSpecialty(true);
    setSpecialtySuccessMessage('');
    setSpecialtyErrorMessage('');
  };

  const handleCancelEditSpecialty = () => {
    setEditingSpecialty(false);
    setNewSpecialty('');
    setSpecialtyErrorMessage('');
  };

  const handleSpecialtyChange = (e: SelectChangeEvent) => {
    setNewSpecialty(e.target.value as Specialty);
  };

  const handleUpdateSpecialty = async () => {
    setSpecialtyErrorMessage('');
    setSpecialtySuccessMessage('');

    if (!newSpecialty) {
      setSpecialtyErrorMessage('Veuillez choisir une spécialité');
      return;
    }

    if (newSpecialty === authenticatedMember?.specialty) {
      setSpecialtyErrorMessage('Veuillez choisir une spécialité différente');
      return;
    }

    try {
      setSpecialtyLoading(true);
      await updateSpecialty({ specialty: newSpecialty });
      setSpecialtySuccessMessage('Spécialité mise à jour avec succès');
      setEditingSpecialty(false);
      setNewSpecialty('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors de la mise à jour de la spécialité';
      setSpecialtyErrorMessage(message);
    } finally {
      setSpecialtyLoading(false);
    }
  };

  const handleEditAvatar = () => {
    setNewProfileImage(authenticatedMember?.profileImage || '');
    setEditingAvatar(true);
    setAvatarSuccessMessage('');
    setAvatarErrorMessage('');
  };

  const handleCancelEditAvatar = () => {
    setEditingAvatar(false);
    setNewProfileImage('');
    setAvatarErrorMessage('');
  };

  const handleUpdateProfileImage = async () => {
    setAvatarErrorMessage('');
    setAvatarSuccessMessage('');

    if (!newProfileImage) {
      setAvatarErrorMessage('Veuillez choisir une image de profil');
      return;
    }

    if (newProfileImage === authenticatedMember?.profileImage) {
      setAvatarErrorMessage('Veuillez choisir une image differente');
      return;
    }

    try {
      setAvatarLoading(true);
      await updateProfileImage({ profileImage: newProfileImage });
      setAvatarSuccessMessage('Image de profil mise a jour avec succes');
      setEditingAvatar(false);
      setNewProfileImage('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise a jour de l'image de profil";
      setAvatarErrorMessage(message);
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!authenticatedMember) return null;

  return (
    <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="h3"
        align="center"
        sx={{
          mb: 4,
          color: '#f0e6d2',
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        Mon profil
      </Typography>

      <Box
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          background:
            'linear-gradient(180deg, rgba(10, 20, 40, 0.95) 0%, rgba(4, 10, 19, 0.98) 100%)',
          border: '1px solid rgba(200, 170, 110, 0.24)',
          boxShadow:
            '0 18px 48px rgba(0, 0, 0, 0.35), inset 0 0 60px rgba(10, 200, 185, 0.03)',
        }}
      >
        <ProfileSummaryCard
          authenticatedMember={authenticatedMember}
          teamName={teamName}
        />

        <ProfileSectionNavigation
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            borderColor: 'rgba(255, 255, 255, 0.08)',
            background:
              'linear-gradient(180deg, rgba(16, 24, 38, 0.94) 0%, rgba(8, 13, 23, 0.98) 100%)',
          }}
        >
          {activeSection === 'overview' && (
            <ProfileOverviewSection
              authenticatedMember={authenticatedMember}
              editingSpecialty={editingSpecialty}
              newSpecialty={newSpecialty}
              onCancelEditSpecialty={handleCancelEditSpecialty}
              onEditSpecialty={handleEditSpecialty}
              onSpecialtyChange={handleSpecialtyChange}
              onUpdateSpecialty={handleUpdateSpecialty}
              specialtyErrorMessage={specialtyErrorMessage}
              specialtyLoading={specialtyLoading}
              specialtySuccessMessage={specialtySuccessMessage}
              teamName={teamName}
              tournaments={tournaments}
              mode="overview"
            />
          )}

          {activeSection === 'tournaments' && (
            <ProfileOverviewSection
              authenticatedMember={authenticatedMember}
              editingSpecialty={editingSpecialty}
              newSpecialty={newSpecialty}
              onCancelEditSpecialty={handleCancelEditSpecialty}
              onEditSpecialty={handleEditSpecialty}
              onSpecialtyChange={handleSpecialtyChange}
              onUpdateSpecialty={handleUpdateSpecialty}
              specialtyErrorMessage={specialtyErrorMessage}
              specialtyLoading={specialtyLoading}
              specialtySuccessMessage={specialtySuccessMessage}
              teamName={teamName}
              tournaments={tournaments}
              mode="tournaments"
            />
          )}

          {activeSection === 'avatar' && (
            <ProfileAvatarSection
              authenticatedMember={authenticatedMember}
              avatarErrorMessage={avatarErrorMessage}
              avatarLoading={avatarLoading}
              avatarSuccessMessage={avatarSuccessMessage}
              avatars={avatars}
              editingAvatar={editingAvatar}
              newProfileImage={newProfileImage}
              onCancelEditAvatar={handleCancelEditAvatar}
              onEditAvatar={handleEditAvatar}
              onSelectAvatar={setNewProfileImage}
              onUpdateProfileImage={handleUpdateProfileImage}
            />
          )}

          {activeSection === 'availability' && (
            <ProfileAvailabilitySection
              endDate={endDate}
              onAddUnavailability={handleAddUnavailability}
              onDeleteUnavailability={handleDeleteUnavailability}
              onEndDateChange={setEndDate}
              onStartDateChange={setStartDate}
              startDate={startDate}
              today={today}
              unavailabilities={unavailabilities}
              unavailabilityErrorMessage={unavailabilityErrorMessage}
            />
          )}

          {activeSection === 'security' && (
            <ProfileSecuritySection
              confirmNewPassword={confirmNewPassword}
              currentPassword={currentPassword}
              errorMessage={errorMessage}
              loading={loading}
              newPassword={newPassword}
              onChangePassword={handleChangePassword}
              onConfirmNewPasswordChange={setConfirmNewPassword}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              successMessage={successMessage}
            />
          )}
        </Paper>

        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 3, color: '#a09b8c' }}
        >
          Retour
        </Button>
      </Box>
    </Container>
  );
};

export default ProfilePage;
