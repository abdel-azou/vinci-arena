import { Notification } from '../types';
import { getToken } from '../utils/session';

const getMyNotifications = async (): Promise<Notification[]> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch('/api/notifications/me', {
    method: 'GET',
    headers: { Authorization: token },
  });

  if (!response.ok)
    throw new Error('Erreur lors du chargement des notifications');
  return response.json();
};

const markAsRead = async (notificationId: number): Promise<Notification> => {
  const token = getToken();
  if (!token) throw new Error('Non authentifié');

  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { Authorization: token },
  });

  if (!response.ok)
    throw new Error('Erreur lors du marquage de la notification');
  return response.json();
};

export { getMyNotifications, markAsRead };
