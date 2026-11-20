import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface OfflineSyncState {
  pendingEventsCount: number;
  isSyncing: boolean;
  lastSyncTimestamp: string | null;
  isOnline: boolean;
  syncErrors: string[];
}

const initialState: OfflineSyncState = {
  pendingEventsCount: 0,
  isSyncing: false,
  lastSyncTimestamp: null,
  isOnline: true,
  syncErrors: [],
};

export const offlineSyncSlice = createSlice({
  name: 'offlineSync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setPendingEventsCount: (state, action: PayloadAction<number>) => {
      state.pendingEventsCount = action.payload;
    },
    incrementPendingEvents: (state) => {
      state.pendingEventsCount += 1;
    },
    syncStarted: (state) => {
      state.isSyncing = true;
    },
    syncSuccess: (state, action: PayloadAction<{ syncedCount: number }>) => {
      state.isSyncing = false;
      state.pendingEventsCount = Math.max(0, state.pendingEventsCount - action.payload.syncedCount);
      state.lastSyncTimestamp = new Date().toISOString();
      state.syncErrors = [];
    },
    syncFailed: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.syncErrors = [action.payload, ...state.syncErrors.slice(0, 4)];
    },
  },
});

export const {
  setOnlineStatus,
  setPendingEventsCount,
  incrementPendingEvents,
  syncStarted,
  syncSuccess,
  syncFailed,
} = offlineSyncSlice.actions;

export default offlineSyncSlice.reducer;
