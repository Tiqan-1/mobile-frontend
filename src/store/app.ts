import { createSlice } from '@reduxjs/toolkit';

export interface AppState {
  isDark: 'dark' | 'light' | null;
}

const initialState: AppState = {
  isDark: null,
};

export const authReducer = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setDark(state, action) {
      state.isDark = action.payload;
    },
  },
});

export const { setDark } = authReducer.actions;

export default authReducer.reducer;
