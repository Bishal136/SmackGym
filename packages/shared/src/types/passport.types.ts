/**
 * Performance Passport & Digital Twin Types
 * Aligned with docs/PRD.md and docs/LLD.md
 */

export type FactDomain =
  | 'equipment'
  | 'injury_restriction'
  | 'training_preference'
  | 'schedule_constraint'
  | 'dietary_nutrition'
  | 'biometric_recovery';

export type FactSourceKind = 'user_declared' | 'session_derived' | 'coach_submitted' | 'device_synced';

export interface PassportFact<T = unknown> {
  id: string;
  userId: string;
  domain: FactDomain;
  key: string;
  value: T;
  sourceKind: FactSourceKind;
  isActive: boolean;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveMedicalHold {
  holdId: string;
  affectedBodyPart: string;
  reasonCode: string;
  declaredAt: string;
  restrictedMovements: string[];
  isCleared: boolean;
  clearedAt?: string;
}

export interface DigitalTwinSnapshot {
  userId: string;
  compiledAt: string;
  availableEquipment: string[];
  activeHolds: ActiveMedicalHold[];
  trainingDaysPerWeek: number;
  sessionDurationMinutes: number;
  readinessScore: number; // 0-100
  isFastingRamadan: boolean;
  menstrualPhase?: 'follicular' | 'ovulatory' | 'luteal' | 'menstrual';
}
