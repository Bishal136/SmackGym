import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export interface IInstitution extends Document<string> {
  _id: string;
  name: string;
  domainPattern: string; // Regex string e.g. "@.*\\.ac\\.uk$" or "@kcl\\.ac\\.uk$"
  totalSeats: number;
  usedSeats: number;
  status: 'active' | 'suspended';
  subscriptionTier: 'enterprise_university';
  samlEntityId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema = new Schema<IInstitution>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      maxlength: 150,
    },
    domainPattern: {
      type: String,
      required: [true, 'Domain pattern is required'],
      trim: true,
      default: '@.*\\.ac\\.uk$',
      index: true,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      default: 500,
    },
    usedSeats: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['enterprise_university'],
      default: 'enterprise_university',
    },
    samlEntityId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

InstitutionSchema.index({ status: 1, domainPattern: 1 });

export const InstitutionModel: Model<IInstitution> =
  mongoose.models.Institution || mongoose.model<IInstitution>('Institution', InstitutionSchema);
