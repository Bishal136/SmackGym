import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export interface ITrainingGroup extends Document<string> {
  _id: string;
  coachId: string;
  name: string;
  description?: string;
  athleteIds: string[];
  programId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingGroupSchema = new Schema<ITrainingGroup>(
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
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    athleteIds: {
      type: [String],
      default: [],
      index: true,
    },
    programId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

TrainingGroupSchema.index({ coachId: 1, name: 1 });

export const TrainingGroupModel: Model<ITrainingGroup> =
  mongoose.models.TrainingGroup || mongoose.model<ITrainingGroup>('TrainingGroup', TrainingGroupSchema);
