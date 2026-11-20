import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export interface IRecoveryCheckin extends Document<string> {
  _id: string;
  userId: string;
  sleepQuality: number;
  sorenessLevel: number;
  energyLevel: number;
  stressLevel: number;
  menstrualSymptoms?: number | null;
  notes?: string | null;
  readinessScore: number; // Normalized 0-100 Daily Readiness Index
  loggedAt: Date;
  createdAt: Date;
}

const RecoveryCheckinSchema = new Schema<IRecoveryCheckin>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sleepQuality: { type: Number, required: true, min: 1, max: 5 },
    sorenessLevel: { type: Number, required: true, min: 1, max: 5 },
    energyLevel: { type: Number, required: true, min: 1, max: 5 },
    stressLevel: { type: Number, required: true, min: 1, max: 5 },
    menstrualSymptoms: { type: Number, min: 1, max: 5, default: null },
    notes: { type: String, default: null },
    readinessScore: { type: Number, required: true, min: 0, max: 100 },
    loggedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    _id: false,
  }
);

// Compound index following ESR: userId (Equality), loggedAt (Sort)
RecoveryCheckinSchema.index({ userId: 1, loggedAt: -1 });

export const RecoveryCheckinModel: Model<IRecoveryCheckin> = mongoose.model<IRecoveryCheckin>(
  'RecoveryCheckin',
  RecoveryCheckinSchema
);
