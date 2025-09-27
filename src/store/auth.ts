import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
  email: string;
  isAuth: boolean;
  isSU: boolean;
  name: string;
  refreshToken: null | string;
  server: string;
  token: null | string;
}

const initialState: AuthState = {
  isAuth: false,
  token: null,
  refreshToken: null,
  name: '',
  email: '',
  isSU: false,
  server: 'production',
};

export const authReducer = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuth = true;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.name = action.payload.name;
      state.email = action.payload.email;
    },
    logout(state) {
      state.isAuth = false;
      state.token = null;
      state.refreshToken = null;
      state.name = '';
      state.email = '';
    },
    setisSUAuth: (draft, action) => {
      draft.isSU = action.payload;
    },
    setAuthServer: (draft, action) => {
      draft.server = action.payload;
    },
  },
});

export const { login, logout, setAuthServer, setisSUAuth } = authReducer.actions;

export default authReducer.reducer;
export type RootState = ReturnType<typeof authReducer.reducer>;
