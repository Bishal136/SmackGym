import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export type SubscriptionTier = 'free' | 'monthly' | 'annual' | 'student';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface ISubscription extends Document<string> {
  _id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
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
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['free', 'monthly', 'annual', 'student'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      default: 'active',
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    _id: false,
  }
);

SubscriptionSchema.index({ userId: 1, status: 1 });

export const SubscriptionModel: Model<ISubscription> = mongoose.model<ISubscription>(
  'Subscription',
  SubscriptionSchema
);
