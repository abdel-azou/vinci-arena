import { AuthenticatedMember, MaybeAuthenticatedMember } from '../types';

const STORAGE_KEY = 'authenticatedMember';

// Stocke le membre (localStorage si rememberMe, sinon sessionStorage)
const storeAuthenticatedMember = (
  member: AuthenticatedMember,
  rememberMe: boolean = false,
) => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(STORAGE_KEY, JSON.stringify(member));
};

// Récupère le membre depuis localStorage ou sessionStorage
const getAuthenticatedMember = (): MaybeAuthenticatedMember => {
  const member =
    localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  if (!member) return undefined;
  return JSON.parse(member);
};

const isAuthenticatedMemberRemembered = (): boolean =>
  localStorage.getItem(STORAGE_KEY) !== null;

// Supprime le membre des deux storages
const clearAuthenticatedMember = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
};

const getToken = (): string | null => {
  const member = getAuthenticatedMember();
  return member?.token ?? null;
};

export {
  storeAuthenticatedMember,
  getAuthenticatedMember,
  isAuthenticatedMemberRemembered,
  clearAuthenticatedMember,
  getToken,
};
