import type { RootState as AppState } from './app';
import type { RootState as AuthState } from './auth';
import type { RootState as documentsSlice } from './documentsSlice';
import type { RootState as SubscriptionState } from './subscriptionSlice';
// import type { RootState as UserState } from './user';

export interface AppStates {
  app: AppState;
  auth: AuthState;
  documents: documentsSlice;
  subscriptions: SubscriptionState;
  // global: GlobalState;
  // user: UserState;
}
