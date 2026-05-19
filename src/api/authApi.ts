import { http } from './http';

export interface RegisterPayload {
  login: string;
  fullName: string;
  password: string;
}

export interface LoginPayload {
  login: string;
  password: string;
}

interface RegisterResponse {
  id: number;
  login: string;
  full_name: string;
  role: string;
}

interface LoginResponse {
  token_type: string;
  token: string;
  expires_at: string;
  user: {
    id: number;
    login: string;
    full_name: string;
    role: string;
    session_id?: string;
  };
}

export interface AuthUser {
  id: number;
  login: string;
  fullName: string;
  role: string;
  sessionId?: string;
}

export interface LoginResult {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

const normalizeAuthUser = (source: LoginResponse['user']): AuthUser => ({
  id: source.id,
  login: source.login,
  fullName: source.full_name,
  role: source.role,
  sessionId: source.session_id,
});

export const AuthApi = {
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const response = await http.post<RegisterResponse>('/users/register', {
      login: payload.login,
      full_name: payload.fullName,
      password: payload.password,
    });

    return {
      id: response.data.id,
      login: response.data.login,
      fullName: response.data.full_name,
      role: response.data.role,
    };
  },

  async login(payload: LoginPayload): Promise<LoginResult> {
    const response = await http.post<LoginResponse>('/users/login', payload);

    return {
      token: response.data.token,
      expiresAt: response.data.expires_at,
      user: normalizeAuthUser(response.data.user),
    };
  },

  async logout(): Promise<void> {
    await http.post('/users/logout', {});
  },
};
