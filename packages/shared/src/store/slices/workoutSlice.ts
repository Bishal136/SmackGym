import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CompletedSet } from '../../types/workout.types.js';

export interface WorkoutState {
  activeSessionId: string | null;
  activeExerciseId: string | null;
  activeExerciseIndex: number;
  completedSets: Record<string, CompletedSet[]>; // Keyed by exerciseId
  activeRestTimerSeconds: number;
  isRestTimerRunning: boolean;
  isPainSafetyHoldActive: boolean;
  activePainHoldDetails: {
    affectedBodyPart: string;
    reasonCode: string;
    notes?: string;
    triggeredAt: string;
  } | null;
}

const initialState: WorkoutState = {
  activeSessionId: null,
  activeExerciseId: null,
  activeExerciseIndex: 0,
  completedSets: {},
  activeRestTimerSeconds: 0,
  isRestTimerRunning: false,
  isPainSafetyHoldActive: false,
  activePainHoldDetails: null,
};

export const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    startWorkoutSession: (
      state,
      action: PayloadAction<{ sessionId: string; firstExerciseId: string }>
    ) => {
      state.activeSessionId = action.payload.sessionId;
      state.activeExerciseId = action.payload.firstExerciseId;
      state.activeExerciseIndex = 0;
      state.completedSets = {};
      state.activeRestTimerSeconds = 0;
      state.isRestTimerRunning = false;
      state.isPainSafetyHoldActive = false;
      state.activePainHoldDetails = null;
    },
    setActiveExercise: (
      state,
      action: PayloadAction<{ exerciseId: string; index: number }>
    ) => {
      state.activeExerciseId = action.payload.exerciseId;
      state.activeExerciseIndex = action.payload.index;
    },
    logCompletedSet: (
      state,
      action: PayloadAction<{ exerciseId: string; set: CompletedSet }>
    ) => {
      const { exerciseId, set } = action.payload;
      const currentSets = state.completedSets[exerciseId] ?? [];
      state.completedSets[exerciseId] = [...currentSets, set];
    },
    startRestTimer: (state, action: PayloadAction<number>) => {
      state.activeRestTimerSeconds = action.payload;
      state.isRestTimerRunning = true;
    },
    tickRestTimer: (state) => {
      if (state.activeRestTimerSeconds > 0) {
        state.activeRestTimerSeconds -= 1;
      } else {
        state.isRestTimerRunning = false;
      }
    },
    stopRestTimer: (state) => {
      state.isRestTimerRunning = false;
      state.activeRestTimerSeconds = 0;
    },
    // Non-bypassable "Something hurts" safety hold: freezes timers immediately
    triggerSomethingHurts: (
      state,
      action: PayloadAction<{
        affectedBodyPart: string;
        reasonCode: string;
        notes?: string;
      }>
    ) => {
      state.isPainSafetyHoldActive = true;
      state.isRestTimerRunning = false;
      state.activeRestTimerSeconds = 0;
      state.activePainHoldDetails = {
        affectedBodyPart: action.payload.affectedBodyPart,
        reasonCode: action.payload.reasonCode,
        notes: action.payload.notes,
        triggeredAt: new Date().toISOString(),
      };
    },
    clearSafetyHold: (state) => {
      state.isPainSafetyHoldActive = false;
      state.activePainHoldDetails = null;
    },
    endWorkoutSession: (state) => {
      state.activeSessionId = null;
      state.activeExerciseId = null;
      state.activeExerciseIndex = 0;
      state.completedSets = {};
      state.isRestTimerRunning = false;
      state.activeRestTimerSeconds = 0;
    },
  },
});

export const {
  startWorkoutSession,
  setActiveExercise,
  logCompletedSet,
  startRestTimer,
  tickRestTimer,
  stopRestTimer,
  triggerSomethingHurts,
  clearSafetyHold,
  endWorkoutSession,
} = workoutSlice.actions;

export default workoutSlice.reducer;
