import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { AuthApi, type AuthUser, type LoginPayload, type RegisterPayload } from '../../api/authApi';
import { clearPersistedAuth, getStoredToken, getStoredUser, persistAuth } from '../../api/authStorage';
import { syncRequestsApiSecurity } from '../../api/generated';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

const extractAuthError = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const backendMessage = typeof error.response?.data?.error === 'string' ? error.response.data.error : null;
  if (backendMessage) return backendMessage;

  if (typeof error.response?.status === 'number') {
    return `${fallback} (${error.response.status})`;
  }
  return fallback;
};

const createInitialState = (): AuthState => {
  const token = getStoredToken();
  const user = getStoredUser();
  const isAuthenticated = Boolean(token && user);

  if (!isAuthenticated && token) {
    try {
      clearPersistedAuth();
    } catch {
      // ignored
    }
    syncRequestsApiSecurity();
  }

  return {
    isAuthenticated,
    user: isAuthenticated ? user : null,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = createInitialState();

export const registerUserThunk = createAsyncThunk<AuthUser, RegisterPayload, { rejectValue: string }>(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      return await AuthApi.register(payload);
    } catch (error) {
      return rejectWithValue(extractAuthError(error, 'Не удалось выполнить регистрацию'));
    }
  },
);

export const loginUserThunk = createAsyncThunk<
  { user: AuthUser; token: string; expiresAt: string },
  LoginPayload,
  { rejectValue: string }
>('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const response = await AuthApi.login(payload);
    persistAuth(response.token, response.user);
    syncRequestsApiSecurity();
    return response;
  } catch (error) {
    return rejectWithValue(extractAuthError(error, 'Не удалось выполнить вход'));
  }
});

export const logoutUserThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await AuthApi.logout();
    } catch {
      // logout endpoint can fail if token expired; local cleanup still required
    }

    try {
      clearPersistedAuth();
      syncRequestsApiSecurity();
      return;
    } catch {
      return rejectWithValue('Не удалось выполнить выход');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось выполнить регистрацию';
      })
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось выполнить вход';
      })
      .addCase(logoutUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось выполнить выход';
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
