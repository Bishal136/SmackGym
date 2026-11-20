/**
 * Workout, Exercise, Offline Sync & Daily Home v4 Types
 */

export interface ExerciseSummary {
  id: string; // EX-XXXX
  name: string;
  movementPattern: 'squat' | 'hinge' | 'push' | 'pull' | 'lunge' | 'carry' | 'isolation';
  targetMuscles: string[];
  equipmentRequired: string[];
  setupCues: string[];
  videoAssetId?: string;
  playbackToken?: string;
}

export interface CompletedSet {
  setId: string; // RFC 4122 UUID
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  rpe?: number; // 1-10 Rating of Perceived Exertion
  isCompleted: boolean;
  loggedAt: string; // ISO 8601
}

export interface SessionEventPayload {
  eventId: string; // Client-generated RFC 4122 UUIDv4 for idempotency
  sessionId: string;
  athleteId: string;
  exerciseId: string;
  setData: CompletedSet;
  eventTimestamp: string;
  syncStatus: 'queued_local' | 'synced_remote' | 'sync_failed';
}

export interface DailyHomeRings {
  readinessScore: number;  // 0-100 (Circle 1)
  weeklyWorkScore: number; // 0-100 (Circle 2)
  safeStreakDays: number;  // Number of consistent safe days (Circle 3)
  foodScore: number;       // 0-100 (Circle 4)
  habitRecoveryScore: number; // 0-100 (Circle 5)
}

export interface NextMoveRecommendation {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  intensityLevel: 'low' | 'moderate' | 'high' | 'active_recovery';
  actionUrl: string;
}

export interface DailyHomeState {
  rings: DailyHomeRings;
  nextMove: NextMoveRecommendation | null;
  isLoading: boolean;
  lastUpdated: string | null;
}
