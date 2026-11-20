import mongoose, { Schema, type Document, type Model } from 'mongoose';
import crypto from 'node:crypto';

export interface IFoodEntry extends Document<string> {
  _id: string;
  userId: string;
  mealName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'suhoor' | 'iftar';
  calories?: number | null;
  proteinGrams?: number | null;
  carbsGrams?: number | null;
  fatGrams?: number | null;
  hydrationMl?: number | null;
  loggedAt: Date;
  createdAt: Date;
}

const FoodEntrySchema = new Schema<IFoodEntry>(
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
    mealName: {
      type: String,
      required: true,
      trim: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'suhoor', 'iftar'],
      required: true,
    },
    calories: { type: Number, default: null },
    proteinGrams: { type: Number, default: null },
    carbsGrams: { type: Number, default: null },
    fatGrams: { type: Number, default: null },
    hydrationMl: { type: Number, default: null },
    loggedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    _id: false,
  }
);

// Compound index following ESR: userId (Equality), loggedAt (Sort)
FoodEntrySchema.index({ userId: 1, loggedAt: -1 });

export const FoodEntryModel: Model<IFoodEntry> = mongoose.model<IFoodEntry>(
  'FoodEntry',
  FoodEntrySchema
);
