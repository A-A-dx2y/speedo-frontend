import { combineReducers, configureStore } from '@reduxjs/toolkit'; 
import authReducer from './slices/authSlice.js'; 
import themeReducer from './slices/themeSlice.js';
import { persistStore, persistReducer } from 'redux-persist'
import storage from './storage.js';
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
});

const persistConfig = {
  key: 'speedo-root',
  storage,
  whitelist: ['auth'] 
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      }
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>; 
export type AppDispatch = typeof store.dispatch;