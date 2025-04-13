import type { Middleware} from '@reduxjs/toolkit';
import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';

import { MMKV } from "react-native-mmkv"
import type { Storage } from 'redux-persist'

import documentsReducer from './documentsSlice';
import authReducer from './auth';
import accessibilityReducer from './accessibilitySlice';
import AppReducer from './app';
import subscriptionsReducer from './subscriptionSlice';

export const storage = new MMKV()

export const reduxStorage: Storage = {
  getItem: (key) => {
    const value = storage.getString(key)
    return Promise.resolve(value)
  },
  removeItem: (key) => {
    storage.delete(key)
    return Promise.resolve()
  },
  setItem: (key, value) => {
    storage.set(key, value)
    return Promise.resolve(true)
  },
}


const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  // Optionally blacklist some state that you don't want to persist
  blacklist: ['currentDownloading', 'accessibility'], // Don't persist accessibility state
};

const rootReducer = combineReducers({
  documents: documentsReducer,
  auth: authReducer,
  accessibility: accessibilityReducer,
  app: AppReducer,
  subscriptions: subscriptionsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
const middlewares: Middleware[] = [];

if (process.env.NODE_ENV === 'development') {
  const {createLogger} = require('redux-logger');
  const logger = createLogger({
    collapsed: true,
    // duration: true,
    // diff: true,
  });
  middlewares.push(logger);
}
export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([...middlewares]),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 