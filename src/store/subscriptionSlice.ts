import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { PURGE } from 'redux-persist';
import type { Subscription } from '@/types/program';

interface SubscriptionsState {
  items: Subscription[];
  lastUpdated: null | number;
}

const initialState: SubscriptionsState = {
  items: [],
  lastUpdated: null,
};

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action: PayloadAction<Subscription[]>) => {
      state.items = action.payload;
      state.lastUpdated = Date.now();
    },
    resetSubscriptions: () => initialState,
  },
  extraReducers: builder => {
    builder.addCase(PURGE, () => initialState);
    builder.addCase('auth/logout', () => initialState);
  },
});

export const { setSubscriptions, resetSubscriptions } = subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
export type RootState = ReturnType<typeof subscriptionsSlice.reducer>;
