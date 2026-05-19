import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { requestsApi, syncRequestsApiSecurity } from '../../api/generated';
import { logoutUserThunk } from './authSlice';

interface DraftState {
  requestId: number | null;
  hasDraft: boolean;
  itemsCount: number;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: DraftState = {
  requestId: null,
  hasDraft: false,
  itemsCount: 0,
  loading: false,
  actionLoading: false,
  error: null,
};

export const loadDraftSummaryThunk = createAsyncThunk<
  { requestId: number | null; itemsCount: number; hasDraft: boolean },
  void,
  { rejectValue: string }
>('draft/loadSummary', async (_, { rejectWithValue }) => {
  try {
    syncRequestsApiSecurity();
    const response = await requestsApi.oxygenationRequest.getCart();
    return {
      requestId: response.data.request_id ?? null,
      itemsCount: response.data.items_count ?? 0,
      hasDraft: response.data.has_draft ?? false,
    };
  } catch {
    return rejectWithValue('Не удалось загрузить черновик');
  }
});

export const addServiceToDraftThunk = createAsyncThunk<
  { requestId: number | null },
  number,
  { rejectValue: string }
>('draft/addServiceToDraft', async (serviceId, { dispatch, rejectWithValue }) => {
  try {
    syncRequestsApiSecurity();
    const response = await requestsApi.requestServices.addServiceToDraft({ service_id: serviceId });
    await dispatch(loadDraftSummaryThunk());
    return {
      requestId: response.data?.request_id ?? null,
    };
  } catch {
    return rejectWithValue('Не удалось добавить услугу в черновик');
  }
});

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    resetDraftState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDraftSummaryThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDraftSummaryThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.requestId = action.payload.requestId;
        state.itemsCount = action.payload.itemsCount;
        state.hasDraft = action.payload.hasDraft;
      })
      .addCase(loadDraftSummaryThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить черновик';
      })
      .addCase(addServiceToDraftThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addServiceToDraftThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        if (action.payload.requestId) {
          state.requestId = action.payload.requestId;
          state.hasDraft = true;
        }
      })
      .addCase(addServiceToDraftThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? 'Не удалось добавить услугу в черновик';
      })
      .addCase(logoutUserThunk.fulfilled, () => initialState);
  },
});

export const { resetDraftState } = draftSlice.actions;
export const draftReducer = draftSlice.reducer;
