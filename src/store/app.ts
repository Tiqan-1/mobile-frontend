import { createSlice } from '@reduxjs/toolkit';

export interface AppState {
  isDark: 'dark' | 'light' | null;
}

const initialState: AppState = {
  isDark: null,
};

export const appReducer = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setDark(state, action) {
      state.isDark = action.payload;
    },
  },
});

export const { setDark } = appReducer.actions;

export default appReducer.reducer;
export type RootState = ReturnType<typeof appReducer.reducer>;
