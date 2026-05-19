import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logoutUserThunk } from './authSlice';

interface ServicesFiltersState {
  oxygenationInput: string;
  appliedOxygenationIndex: string;
}

const initialState: ServicesFiltersState = {
  oxygenationInput: '',
  appliedOxygenationIndex: '',
};

const servicesFiltersSlice = createSlice({
  name: 'servicesFilters',
  initialState,
  reducers: {
    setOxygenationInput(state, action: PayloadAction<string>) {
      state.oxygenationInput = action.payload;
    },
    applyOxygenationIndex(state, action: PayloadAction<string>) {
      state.appliedOxygenationIndex = action.payload;
      state.oxygenationInput = action.payload;
    },
    resetServicesFilters: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logoutUserThunk.fulfilled, () => initialState);
  },
});

export const { setOxygenationInput, applyOxygenationIndex, resetServicesFilters } = servicesFiltersSlice.actions;
export const servicesFiltersReducer = servicesFiltersSlice.reducer;
