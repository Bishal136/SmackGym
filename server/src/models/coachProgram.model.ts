import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export interface ICoachProgram extends Document<string> {
  _id: string;
  coachId: string;
  title: string;
  description: string;
  weeksCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  weeklySchedule: Array<{
    dayNumber: number;
    focus: string;
    exerciseIds: string[];
  }>;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CoachProgramSchema = new Schema<ICoachProgram>(
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
    title: {
      type: String,
      required: [true, 'Program title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Program description is required'],
      maxlength: 2000,
    },
    weeksCount: {
      type: Number,
      required: true,
      min: 1,
      max: 52,
      default: 8,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'elite'],
      default: 'intermediate',
    },
    weeklySchedule: [
      {
        dayNumber: { type: Number, required: true },
        focus: { type: String, required: true },
        exerciseIds: { type: [String], default: [] },
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CoachProgramSchema.index({ coachId: 1, isPublished: 1 });

export const CoachProgramModel: Model<ICoachProgram> =
  mongoose.models.CoachProgram || mongoose.model<ICoachProgram>('CoachProgram', CoachProgramSchema);
