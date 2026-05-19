import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RequestResponse } from '../../api/generated/Api';
import { requestsApi, syncRequestsApiSecurity } from '../../api/generated';
import { logoutUserThunk } from './authSlice';

interface RequestsFilters {
  status: '' | 'formed' | 'completed' | 'rejected';
  formedFrom: string;
  formedTo: string;
  creatorFilter: string;
}

interface RequestsListState {
  items: RequestResponse[];
  loading: boolean;
  error: string | null;
  filters: RequestsFilters;
}

const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createInitialFilters = (): RequestsFilters => ({
  status: '',
  formedFrom: getTodayDate(),
  formedTo: getTodayDate(),
  creatorFilter: '',
});

const initialState: RequestsListState = {
  items: [],
  loading: false,
  error: null,
  filters: createInitialFilters(),
};

const localTimezoneOffset = (): string => {
  const offsetMinutes = -new Date().getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
};

const toApiFormedFrom = (value: string): string | undefined =>
  value ? `${value}T00:00:00${localTimezoneOffset()}` : undefined;
const toApiFormedTo = (value: string): string | undefined =>
  value ? `${value}T23:59:59${localTimezoneOffset()}` : undefined;

const extractApiError = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return fallback;

  const backendMessage = typeof error.response?.data?.error === 'string' ? error.response.data.error : null;
  if (backendMessage) return backendMessage;

  if (typeof error.response?.status === 'number') {
    return `${fallback} (${error.response.status})`;
  }
  return fallback;
};

export const fetchRequestsThunk = createAsyncThunk<RequestResponse[], void, { rejectValue: string }>(
  'requestsList/fetch',
  async (_, { getState, rejectWithValue }) => {
    try {
      syncRequestsApiSecurity();
      const state = getState() as { requestsList: RequestsListState };
      const { status, formedFrom, formedTo } = state.requestsList.filters;

      const response = await requestsApi.oxygenationRequest.listRequests({
        status: status || undefined,
        formed_from: toApiFormedFrom(formedFrom),
        formed_to: toApiFormedTo(formedTo),
      });

      return response.data.items ?? [];
    } catch (error) {
      return rejectWithValue(extractApiError(error, 'Не удалось загрузить список заявок'));
    }
  },
);

const requestsListSlice = createSlice({
  name: 'requestsList',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<RequestsFilters['status']>) {
      state.filters.status = action.payload;
    },
    setFormedFromFilter(state, action: PayloadAction<string>) {
      state.filters.formedFrom = action.payload;
    },
    setFormedToFilter(state, action: PayloadAction<string>) {
      state.filters.formedTo = action.payload;
    },
    setCreatorFilter(state, action: PayloadAction<string>) {
      state.filters.creatorFilter = action.payload;
    },
    resetRequestsFilters(state) {
      state.filters = createInitialFilters();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequestsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRequestsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить список заявок';
      })
      .addCase(logoutUserThunk.fulfilled, () => ({
        ...initialState,
        filters: createInitialFilters(),
      }));
  },
});

export const {
  setStatusFilter,
  setFormedFromFilter,
  setFormedToFilter,
  setCreatorFilter,
  resetRequestsFilters,
} = requestsListSlice.actions;
export const requestsListReducer = requestsListSlice.reducer;
