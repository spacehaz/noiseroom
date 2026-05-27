import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './auth.slice';
import { vocabulariesSlice } from './vocabularies.slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    vocabularies: vocabulariesSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
