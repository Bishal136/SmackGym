import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';
import type { FactDomain, FactSourceKind, PassportFact } from '@smackgym/shared';

export interface IPassportFact extends Document<string> {
  _id: string;
  userId: string;
  domain: FactDomain;
  key: string;
  value: any;
  sourceKind: FactSourceKind;
  isActive: boolean;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  toFact(): PassportFact;
}

const PassportFactSchema = new Schema<IPassportFact>(
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
    domain: {
      type: String,
      enum: [
        'equipment',
        'injury_restriction',
        'training_preference',
        'schedule_constraint',
        'dietary_nutrition',
        'biometric_recovery',
      ],
      required: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    sourceKind: {
      type: String,
      enum: ['user_declared', 'session_derived', 'coach_submitted', 'device_synced'],
      default: 'user_declared',
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Compound index following ESR: userId (Equality), domain (Equality), isActive (Equality)
PassportFactSchema.index({ userId: 1, domain: 1, isActive: 1 });
PassportFactSchema.index({ userId: 1, key: 1, isActive: 1 });

PassportFactSchema.methods.toFact = function (): PassportFact {
  return {
    id: this._id,
    userId: this.userId,
    domain: this.domain,
    key: this.key,
    value: this.value,
    sourceKind: this.sourceKind,
    isActive: this.isActive,
    revision: this.revision,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const PassportFactModel: Model<IPassportFact> = mongoose.model<IPassportFact>(
  'PassportFact',
  PassportFactSchema
);
