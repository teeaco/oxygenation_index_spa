import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RequestResponse } from '../../api/generated/Api';
import { requestsApi, syncRequestsApiSecurity } from '../../api/generated';
import { loadDraftSummaryThunk } from './draftSlice';
import { logoutUserThunk } from './authSlice';

interface RequestState {
  current: RequestResponse | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  current: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const fetchRequestByIdThunk = createAsyncThunk<RequestResponse, number, { rejectValue: string }>(
  'request/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      syncRequestsApiSecurity();
      const response = await requestsApi.oxygenationRequest.getRequestById({ id });
      return response.data;
    } catch {
      return rejectWithValue('Не удалось загрузить заявку');
    }
  },
);

export const updateRequestThunk = createAsyncThunk<
  RequestResponse,
  { id: number; patientName?: string; bloodValuePaO2?: number; fiO2Value?: number },
  { rejectValue: string }
>('request/updateRequest', async (payload, { rejectWithValue }) => {
  try {
    syncRequestsApiSecurity();
    const response = await requestsApi.oxygenationRequest.updateRequest(
      { id: payload.id },
      {
        patient_name: payload.patientName,
        blood_value_pao2: payload.bloodValuePaO2,
        fio2_value: payload.fiO2Value,
      },
    );
    return response.data;
  } catch {
    return rejectWithValue('Не удалось обновить заявку');
  }
});

export const formRequestThunk = createAsyncThunk<RequestResponse, number, { rejectValue: string }>(
  'request/formRequest',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      syncRequestsApiSecurity();
      const response = await requestsApi.oxygenationRequest.formRequest({ id });
      await dispatch(loadDraftSummaryThunk());
      return response.data;
    } catch {
      return rejectWithValue('Не удалось сформировать заявку');
    }
  },
);

export const deleteRequestThunk = createAsyncThunk<number, number, { rejectValue: string }>(
  'request/deleteRequest',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      syncRequestsApiSecurity();
      await requestsApi.oxygenationRequest.deleteRequest({ id });
      await dispatch(loadDraftSummaryThunk());
      return id;
    } catch {
      return rejectWithValue('Не удалось удалить заявку');
    }
  },
);

export const updateRequestServiceThunk = createAsyncThunk<
  number,
  { requestId: number; serviceId: number; doctorComment: string },
  { rejectValue: string }
>('request/updateRequestService', async ({ requestId, serviceId, doctorComment }, { dispatch, rejectWithValue }) => {
  try {
    syncRequestsApiSecurity();
    await requestsApi.requestServices.updateRequestService(
      {
        requestId,
        serviceId,
      },
      {
        doctor_comment: doctorComment,
      },
    );
    await dispatch(fetchRequestByIdThunk(requestId));
    return requestId;
  } catch {
    return rejectWithValue('Не удалось обновить комментарий по услуге');
  }
});

export const deleteRequestServiceThunk = createAsyncThunk<
  number,
  { requestId: number; serviceId: number },
  { rejectValue: string }
>('request/deleteRequestService', async ({ requestId, serviceId }, { dispatch, rejectWithValue }) => {
  try {
    syncRequestsApiSecurity();
    await requestsApi.requestServices.deleteRequestService({
      requestId,
      serviceId,
    });
    await dispatch(fetchRequestByIdThunk(requestId));
    await dispatch(loadDraftSummaryThunk());
    return requestId;
  } catch {
    return rejectWithValue('Не удалось удалить услугу из заявки');
  }
});

export const reviewRequestThunk = createAsyncThunk<
  RequestResponse,
  { id: number; action: 'complete' | 'reject' },
  { rejectValue: string }
>('request/reviewRequest', async ({ id, action }, { rejectWithValue }) => {
  try {
    syncRequestsApiSecurity();
    const response = await requestsApi.oxygenationRequest.reviewRequest(
      {
        id,
      },
      {
        action,
      },
    );
    return response.data;
  } catch {
    return rejectWithValue('Не удалось изменить статус заявки');
  }
});

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    clearCurrentRequest(state) {
      state.current = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequestByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequestByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchRequestByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Не удалось загрузить заявку';
      })
      .addCase(updateRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateRequestThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.current = action.payload;
      })
      .addCase(updateRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? 'Не удалось обновить заявку';
      })
      .addCase(formRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(formRequestThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.current = action.payload;
      })
      .addCase(formRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? 'Не удалось сформировать заявку';
      })
      .addCase(deleteRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteRequestThunk.fulfilled, (state) => {
        state.actionLoading = false;
        state.current = null;
      })
      .addCase(deleteRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? 'Не удалось удалить заявку';
      })
      .addCase(updateRequestServiceThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateRequestServiceThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateRequestServiceThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? 'Не удалось обновить комментарий по услуге';
      })
      .addCase(deleteRequestServiceThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteRequestServiceThunk.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteRequestServiceThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? 'Не удалось удалить услугу из заявки';
      })
      .addCase(reviewRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(reviewRequestThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.current = action.payload;
      })
      .addCase(reviewRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload ?? 'Не удалось изменить статус заявки';
      })
      .addCase(logoutUserThunk.fulfilled, () => initialState);
  },
});

export const { clearCurrentRequest } = requestSlice.actions;
export const requestReducer = requestSlice.reducer;
