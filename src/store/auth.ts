import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  isAuth: boolean;
  refreshToken: null | string;
  token: null | string;
}


const initialState: AuthState = {
  isAuth: false,
  token: null,
  refreshToken: null,
};

export const authReducer = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuth = true;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    logout(state) {
      state.isAuth = false;
      state.token = null;
    },
  },
});

export const { login, logout } = authReducer.actions;

export default authReducer.reducer;
