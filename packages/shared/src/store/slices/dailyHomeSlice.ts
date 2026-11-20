import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DailyHomeRings, NextMoveRecommendation } from '../../types/workout.types.js';

export type RingKey = 'readiness' | 'weeklyWork' | 'streak' | 'food' | 'habit';

export interface DailyHomeSliceState {
  rings: DailyHomeRings;
  nextMove: NextMoveRecommendation | null;
  selectedRing: RingKey | null;
  isLoading: boolean;
  lastUpdated: string | null;
}

const initialState: DailyHomeSliceState = {
  rings: {
    readinessScore: 84, // Default baseline 0-100
    weeklyWorkScore: 60,
    safeStreakDays: 14,
    foodScore: 78,
    habitRecoveryScore: 92,
  },
  nextMove: {
    id: 'next_move_01',
    title: 'Upper Body Hypertrophy — Push Focus',
    subtitle: '45 mins • Dumbbells & Bench Required',
    estimatedMinutes: 45,
    intensityLevel: 'moderate',
    actionUrl: '/workout/session_today',
  },
  selectedRing: null,
  isLoading: false,
  lastUpdated: null,
};

export const dailyHomeSlice = createSlice({
  name: 'dailyHome',
  initialState,
  reducers: {
    setDailyHomeData: (
      state,
      action: PayloadAction<{
        rings: DailyHomeRings;
        nextMove: NextMoveRecommendation | null;
      }>
    ) => {
      state.rings = action.payload.rings;
      state.nextMove = action.payload.nextMove;
      state.lastUpdated = new Date().toISOString();
      state.isLoading = false;
    },
    selectRing: (state, action: PayloadAction<RingKey | null>) => {
      state.selectedRing = action.payload;
    },
    updateReadinessScore: (state, action: PayloadAction<number>) => {
      state.rings.readinessScore = action.payload;
    },
    setDailyHomeLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setDailyHomeData,
  selectRing,
  updateReadinessScore,
  setDailyHomeLoading,
} = dailyHomeSlice.actions;

export default dailyHomeSlice.reducer;
