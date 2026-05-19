import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/authSlice';
import { draftReducer } from './slices/draftSlice';
import { requestReducer } from './slices/requestSlice';
import { requestsListReducer } from './slices/requestsListSlice';
import { servicesFiltersReducer } from './slices/servicesFiltersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    draft: draftReducer,
    request: requestReducer,
    requestsList: requestsListReducer,
    servicesFilters: servicesFiltersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
