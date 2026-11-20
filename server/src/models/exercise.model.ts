import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';
import type { ExerciseSummary } from '@smackgym/shared';

export interface IExercise extends Document<string> {
  _id: string;
  name: string;
  movementPattern: 'squat' | 'hinge' | 'push' | 'pull' | 'lunge' | 'carry' | 'isolation';
  targetMuscles: string[];
  equipmentRequired: string[];
  setupCues: string[];
  videoAssetId: string;
  isLicensed: boolean;
  isCompound: boolean;
  toSummary(playbackToken?: string): ExerciseSummary;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    _id: {
      type: String,
      default: () => `EX-${crypto.randomUUID().slice(0, 8)}`,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    movementPattern: {
      type: String,
      enum: ['squat', 'hinge', 'push', 'pull', 'lunge', 'carry', 'isolation'],
      required: true,
      index: true,
    },
    targetMuscles: {
      type: [String],
      required: true,
      default: [],
    },
    equipmentRequired: {
      type: [String],
      required: true,
      default: ['bodyweight'],
    },
    setupCues: {
      type: [String],
      default: [],
    },
    videoAssetId: {
      type: String,
      required: true,
      default: 'video-default-asset',
    },
    isLicensed: {
      type: Boolean,
      default: true,
    },
    isCompound: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: false,
  }
);

ExerciseSchema.index({ movementPattern: 1, isLicensed: 1 });

ExerciseSchema.methods.toSummary = function (playbackToken?: string): ExerciseSummary {
  return {
    id: this._id,
    name: this.name,
    movementPattern: this.movementPattern,
    targetMuscles: this.targetMuscles,
    equipmentRequired: this.equipmentRequired,
    setupCues: this.setupCues,
    videoAssetId: this.videoAssetId,
    playbackToken,
  };
};

export const ExerciseModel: Model<IExercise> = mongoose.model<IExercise>(
  'Exercise',
  ExerciseSchema
);
