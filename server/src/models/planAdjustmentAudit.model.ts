import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export interface IPlanAdjustmentAudit extends Document<string> {
  _id: string;
  coachId: string;
  athleteId: string;
  planId: string;
  previousExercises: Array<{
    exerciseId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeightKg: number;
  }>;
  proposedExercises: Array<{
    exerciseId: string;
    name: string;
    targetSets: number;
    targetReps: number;
    targetWeightKg: number;
  }>;
  rationale: string;
  status: 'proposed' | 'accepted' | 'rejected';
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlanAdjustmentAuditSchema = new Schema<IPlanAdjustmentAudit>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    coachId: {
      type: String,
      required: [true, 'coachId is required'],
      index: true,
    },
    athleteId: {
      type: String,
      required: [true, 'athleteId is required'],
      index: true,
    },
    planId: {
      type: String,
      required: [true, 'planId is required'],
      index: true,
    },
    previousExercises: [
      {
        exerciseId: { type: String, required: true },
        name: { type: String, required: true },
        targetSets: { type: Number, required: true },
        targetReps: { type: Number, required: true },
        targetWeightKg: { type: Number, required: true },
      },
    ],
    proposedExercises: [
      {
        exerciseId: { type: String, required: true },
        name: { type: String, required: true },
        targetSets: { type: Number, required: true },
        targetReps: { type: Number, required: true },
        targetWeightKg: { type: Number, required: true },
      },
    ],
    rationale: {
      type: String,
      required: [true, 'Adjustment rationale is required'],
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'rejected'],
      default: 'proposed',
      index: true,
    },
    appliedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

PlanAdjustmentAuditSchema.index({ athleteId: 1, planId: 1, appliedAt: -1 });

export const PlanAdjustmentAuditModel: Model<IPlanAdjustmentAudit> =
  mongoose.models.PlanAdjustmentAudit ||
  mongoose.model<IPlanAdjustmentAudit>('PlanAdjustmentAudit', PlanAdjustmentAuditSchema);
