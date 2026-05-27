import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  username: string | null;
  pin: string | null;
}

const initialState: AuthState = {
  token: null,
  username: null,
  pin: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; username: string }>) {
      state.token = action.payload.token;
      state.username = action.payload.username;
    },
    setPin(state, action: PayloadAction<string>) {
      state.pin = action.payload;
    },
    clearAuth(state) {
      state.token = null;
      state.username = null;
      state.pin = null;
    },
  },
});

export const { setAuth, setPin, clearAuth } = authSlice.actions;
