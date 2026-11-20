import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthState } from './slices/authSlice.js';

declare const process: { env: Record<string, string | undefined> } | undefined;

const getApiBaseUrl = (): string => {
  if (typeof process !== 'undefined' && process?.env) {
    return process.env['EXPO_PUBLIC_API_URL'] || process.env['VITE_API_URL'] || 'http://localhost:5000/v1';
  }
  return 'http://localhost:5000/v1';
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth?: AuthState };
      const token = state.auth?.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'User',
    'Passport',
    'Plan',
    'Workout',
    'Food',
    'Recovery',
    'KillSwitch',
    'CoachRoster',
  ],
  endpoints: () => ({}),
});
