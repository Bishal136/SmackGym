import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';
import type { UserProfile, UserRole, UserMode } from '@smackgym/shared';

export interface IUser extends Document<string> {
  _id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  is18Plus: boolean;
  birthDate?: Date;
  mode: UserMode;
  avatarUrl?: string | null;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
  toProfile(): UserProfile;
}

const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID(),
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      enum: ['ATHLETE', 'COACH', 'SUPER_ADMIN'],
      default: 'ATHLETE',
      index: true,
    },
    is18Plus: {
      type: Boolean,
      required: [true, '18+ age verification is required'],
    },
    birthDate: {
      type: Date,
      required: false,
    },
    mode: {
      type: String,
      enum: ['personal', 'professional'],
      default: 'personal',
    },
    avatarUrl: {
      type: String,
      default: null,
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

// Compound index following ESR: role (Equality), createdAt (Sort)
UserSchema.index({ role: 1, createdAt: -1 });

// Instance method to serialize User into clean UserProfile
UserSchema.methods.toProfile = function (): UserProfile {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    role: this.role,
    is18Plus: this.is18Plus,
    birthDate: this.birthDate ? this.birthDate.toISOString() : undefined,
    avatarUrl: this.avatarUrl ?? undefined,
    mode: this.mode,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);
