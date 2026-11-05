export type TournamentFormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: string;
};

export const getMinimumSelectableDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10);
};

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('fr-BE', {
    dateStyle: 'medium',
  });

export const toApiDateTime = (dateValue: string) => `${dateValue}T00:00`;

export const dateFieldSx = {
  '& input::-webkit-calendar-picker-indicator': {
    filter: 'invert(1)',
    opacity: 1,
    cursor: 'pointer',
  },
};

export const emptyFormData: TournamentFormData = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  registrationDeadline: '',
  maxTeams: '16',
};

export const validateTournamentForm = (
  formData: TournamentFormData,
  minimumDate: string,
) => {
  if (
    !formData.name.trim() ||
    !formData.description.trim() ||
    !formData.startDate ||
    !formData.endDate ||
    !formData.registrationDeadline ||
    !formData.maxTeams.trim()
  ) {
    return 'Tous les champs sont obligatoires';
  }

  const parsedMaxTeams = Number(formData.maxTeams);
  if (!Number.isInteger(parsedMaxTeams) || parsedMaxTeams <= 0) {
    return "Le nombre maximum d'équipes doit être un entier supérieur à 0";
  }

  if (formData.registrationDeadline >= formData.startDate) {
    return "La date limite d'inscription doit être avant la date de début du tournoi";
  }

  if (formData.endDate <= formData.startDate) {
    return 'La date de fin doit être après la date de début';
  }

  if (formData.registrationDeadline < minimumDate) {
    return "La date limite d'inscription ne peut pas être dans le passé";
  }

  if (formData.startDate < minimumDate) {
    return 'La date de début ne peut pas être dans le passé';
  }

  if (formData.endDate < minimumDate) {
    return 'La date de fin ne peut pas être dans le passé';
  }

  return null;
};

export const getTournamentPayload = (formData: TournamentFormData) => ({
  name: formData.name,
  description: formData.description,
  startDate: toApiDateTime(formData.startDate),
  endDate: toApiDateTime(formData.endDate),
  registrationDeadline: toApiDateTime(formData.registrationDeadline),
  maxTeams: Number(formData.maxTeams),
});
