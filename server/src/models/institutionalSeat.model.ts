import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export interface IInstitutionalSeat extends Document<string> {
  _id: string;
  institutionId: string;
  userId: string;
  userEmail: string;
  status: 'active' | 'revoked';
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionalSeatSchema = new Schema<IInstitutionalSeat>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    institutionId: {
      type: String,
      required: [true, 'institutionId is required'],
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'userId is required'],
      index: true,
    },
    userEmail: {
      type: String,
      required: [true, 'userEmail is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
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

InstitutionalSeatSchema.index({ institutionId: 1, userId: 1 }, { unique: true });
InstitutionalSeatSchema.index({ institutionId: 1, status: 1 });

export const InstitutionalSeatModel: Model<IInstitutionalSeat> =
  mongoose.models.InstitutionalSeat ||
  mongoose.model<IInstitutionalSeat>('InstitutionalSeat', InstitutionalSeatSchema);
