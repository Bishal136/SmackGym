import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export type GrantScope =
  | 'training_logs'
  | 'recovery_scores'
  | 'fasting_data'
  | 'cycle_data'
  | 'pregnancy_notes'
  | 'ai_chat';

export const ARTICLE_9_SPECIAL_SCOPES: GrantScope[] = [
  'fasting_data',
  'cycle_data',
  'pregnancy_notes',
  'ai_chat',
];

export interface IScopedGrant extends Document<string> {
  _id: string;
  athleteId: string;
  coachId: string;
  scopes: GrantScope[];
  isActive: boolean;
  expiresAt?: Date;
  grantedAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScopedGrantSchema = new Schema<IScopedGrant>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    athleteId: {
      type: String,
      required: [true, 'athleteId is required'],
      index: true,
    },
    coachId: {
      type: String,
      required: [true, 'coachId is required'],
      index: true,
    },
    scopes: {
      type: [String],
      enum: [
        'training_logs',
        'recovery_scores',
        'fasting_data',
        'cycle_data',
        'pregnancy_notes',
        'ai_chat',
      ],
      required: true,
      default: ['training_logs', 'recovery_scores'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    grantedAt: {
      type: Date,
      default: () => new Date(),
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ScopedGrantSchema.index({ athleteId: 1, coachId: 1, isActive: 1 });

export const ScopedGrantModel: Model<IScopedGrant> =
  mongoose.models.ScopedGrant || mongoose.model<IScopedGrant>('ScopedGrant', ScopedGrantSchema);
