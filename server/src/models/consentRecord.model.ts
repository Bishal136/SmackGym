import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export type ConsentType = 'TOS_AND_PRIVACY' | 'ARTICLE_9_HEALTH' | 'MARKETING';

export interface IConsentRecord extends Document<string> {
  _id: string;
  userId: string;
  consentType: ConsentType;
  consentGiven: boolean;
  policyVersion: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecord>(
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
    consentType: {
      type: String,
      enum: ['TOS_AND_PRIVACY', 'ARTICLE_9_HEALTH', 'MARKETING'],
      required: true,
    },
    consentGiven: {
      type: Boolean,
      required: true,
    },
    policyVersion: {
      type: String,
      required: true,
      default: '1.0',
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    _id: false,
  }
);

// Compound index following ESR: userId (Equality), consentType (Equality), timestamp (Sort)
ConsentRecordSchema.index({ userId: 1, consentType: 1, timestamp: -1 });

export const ConsentRecordModel: Model<IConsentRecord> = mongoose.model<IConsentRecord>(
  'ConsentRecord',
  ConsentRecordSchema
);
