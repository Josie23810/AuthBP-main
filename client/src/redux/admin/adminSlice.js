import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentAdmin: null,
  loading: false,
  error: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    adminSignInStart: (state) => {
      state.loading = true;
      state.error = false;
    },
    adminSignInSuccess: (state, action) => {
      state.currentAdmin = action.payload;
      state.loading = false;
      state.error = false;
    },
    adminSignInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    adminSignOut: (state) => {
      state.currentAdmin = null;
      state.loading = false;
      state.error = false;
    },
    adminUpdate: (state, action) => {
      state.currentAdmin = { ...state.currentAdmin, ...action.payload };
    },
  },
});

export const {
  adminSignInStart,
  adminSignInSuccess,
  adminSignInFailure,
  adminSignOut,
  adminUpdate,
} = adminSlice.actions;

export default adminSlice.reducer;
