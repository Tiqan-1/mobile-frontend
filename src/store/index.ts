import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import { Storage } from 'redux-persist'
import { MMKV } from "react-native-mmkv"

const storage = new MMKV()

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


import documentsReducer from './documentsSlice';
const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  // Optionally blacklist some state that you don't want to persist
  blacklist: ['currentDownloading'], 
};

const rootReducer = combineReducers({
  documents: documentsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
const middlewares = [];

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