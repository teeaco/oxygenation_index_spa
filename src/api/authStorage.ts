const AUTH_TOKEN_KEY = 'rip_auth_token';
const AUTH_USER_KEY = 'rip_auth_user';

export interface StoredAuthUser {
  id: number;
  login: string;
  fullName: string;
  role: string;
  sessionId?: string;
}

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getStoredUser = (): StoredAuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthUser;
    return parsed?.login ? parsed : null;
  } catch {
    return null;
  }
};

export const persistAuth = (token: string, user: StoredAuthUser) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearPersistedAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};
