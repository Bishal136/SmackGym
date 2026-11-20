import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';
import type { ActiveMedicalHold } from '@smackgym/shared';

export interface IPlanExercise {
  exerciseId: string;
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg: number;
  restSeconds: number;
  movementPattern: string;
}

export interface IPlan extends Document<string> {
  _id: string;
  userId: string;
  targetDate: string;
  exercises: IPlanExercise[];
  rationaleCodes: string[];
  isRestricted: boolean;
  holdApplied?: ActiveMedicalHold;
  status: 'generated' | 'accepted' | 'adapted' | 'completed';
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanExerciseSchema = new Schema<IPlanExercise>(
  {
    exerciseId: { type: String, required: true },
    name: { type: String, required: true },
    targetSets: { type: Number, required: true, default: 3 },
    targetReps: { type: Number, required: true, default: 10 },
    targetWeightKg: { type: Number, required: true, default: 0 },
    restSeconds: { type: Number, required: true, default: 90 },
    movementPattern: { type: String, required: true },
  },
  { _id: false }
);

const PlanSchema = new Schema<IPlan>(
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
    targetDate: {
      type: String,
      required: true,
      index: true,
    },
    exercises: {
      type: [PlanExerciseSchema],
      required: true,
      default: [],
    },
    rationaleCodes: {
      type: [String],
      default: [],
    },
    isRestricted: {
      type: Boolean,
      default: false,
    },
    holdApplied: {
      type: Schema.Types.Mixed,
      required: false,
    },
    status: {
      type: String,
      enum: ['generated', 'accepted', 'adapted', 'completed'],
      default: 'generated',
      index: true,
    },
    revision: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: false,
  }
);

// Compound index following ESR: userId (Equality), targetDate (Sort)
PlanSchema.index({ userId: 1, targetDate: -1 });
PlanSchema.index({ userId: 1, status: 1 });

export const PlanModel: Model<IPlan> = mongoose.model<IPlan>('Plan', PlanSchema);
