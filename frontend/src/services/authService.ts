import { AuthenticatedMember, Credentials, RegisterRequest } from '../types';

const readErrorMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const body = await response.json();
    return body.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const register = async (request: RegisterRequest): Promise<void> => {
  const response = await fetch('/api/auths/register', {
    method: 'POST',
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 409) {
    throw new Error('Email ou tag déjà utilisé');
  }

  if (response.status === 400) {
    throw new Error(await readErrorMessage(response, 'Données invalides'));
  }

  if (!response.ok) {
    throw new Error("Erreur lors de l'inscription");
  }
};

const login = async (
  credentials: Credentials,
  rememberMe = false,
): Promise<AuthenticatedMember> => {
  const url = rememberMe
    ? '/api/auths/login?rememberMe=true'
    : '/api/auths/login';

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(credentials),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new Error('Email ou mot de passe incorrect');
  }

  if (response.status === 403) {
    throw new Error(
      await readErrorMessage(
        response,
        'Ce compte a été banni. Contactez un administrateur.',
      ),
    );
  }

  if (response.status === 400) {
    throw new Error(await readErrorMessage(response, 'Données invalides'));
  }

  if (!response.ok) {
    throw new Error('Erreur de connexion');
  }

  return response.json();
};

const refreshAuthenticatedMember = async (
  token: string,
): Promise<AuthenticatedMember> => {
  const response = await fetch('/api/members/me', {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  });

  if (!response.ok) {
    throw new Error('Invalid or expired token');
  }

  return response.json();
};

export { login, refreshAuthenticatedMember, register };
