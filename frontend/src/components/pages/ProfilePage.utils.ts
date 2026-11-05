import { MemberUnavailability } from '../../types';

export type ProfileSection =
  | 'overview'
  | 'avatar'
  | 'availability'
  | 'tournaments'
  | 'security';

export const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatProfileDate = (dateString?: string) => {
  if (!dateString) {
    return 'Non disponible';
  }

  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const toDateOnly = (value: string) => value.slice(0, 10);

export const hasOverlappingUnavailability = (
  unavailabilities: MemberUnavailability[],
  newStartDate: string,
  newEndDate: string,
) =>
  unavailabilities.some((existing) => {
    const existingStartDate = toDateOnly(existing.startDate);
    const existingEndDate = toDateOnly(existing.endDate);
    return newStartDate <= existingEndDate && existingStartDate <= newEndDate;
  });
