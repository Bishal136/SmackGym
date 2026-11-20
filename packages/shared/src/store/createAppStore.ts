import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import workoutReducer from './slices/workoutSlice.js';
import dailyHomeReducer from './slices/dailyHomeSlice.js';
import offlineSyncReducer from './slices/offlineSyncSlice.js';
import { baseApi } from './baseApi.js';

export const rootReducer = combineReducers({
  auth: authReducer,
  workout: workoutReducer,
  dailyHome: dailyHomeReducer,
  offlineSync: offlineSyncReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export interface StoreOptions {
  preloadedState?: Partial<RootState>;
  extraMiddlewares?: any[];
}

export const createAppStore = (options: StoreOptions = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: options.preloadedState as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore non-serializable values if needed for native bridges
          ignoredActions: ['offlineSync/syncStarted'],
        },
      }).concat(baseApi.middleware, ...(options.extraMiddlewares || [])),
  });
};

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
