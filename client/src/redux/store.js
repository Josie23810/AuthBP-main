import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice.js';
import adminReducer from './admin/adminSlice.js';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['currentUser'],
};

const adminPersistConfig = {
  key: 'admin',
  storage,
  whitelist: ['currentAdmin'],
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userReducer),
  admin: persistReducer(adminPersistConfig, adminReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
