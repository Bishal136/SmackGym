import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export type RosterStatus = 'active' | 'pending' | 'archived';

export interface ICoachRoster extends Document<string> {
  _id: string;
  coachId: string;
  athleteId: string;
  status: RosterStatus;
  notes?: string;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CoachRosterSchema = new Schema<ICoachRoster>(
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
    status: {
      type: String,
      enum: ['active', 'pending', 'archived'],
      default: 'active',
      index: true,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    assignedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique coach-athlete assignment & efficient roster lookups
CoachRosterSchema.index({ coachId: 1, athleteId: 1 }, { unique: true });
CoachRosterSchema.index({ athleteId: 1, status: 1 });

export const CoachRosterModel: Model<ICoachRoster> =
  mongoose.models.CoachRoster || mongoose.model<ICoachRoster>('CoachRoster', CoachRosterSchema);
