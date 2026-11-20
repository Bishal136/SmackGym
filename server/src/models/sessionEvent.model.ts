import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { CompletedSet } from '@smackgym/shared';

export interface ISessionEvent extends Document<string> {
  _id: string; // eventId from client
  sessionId: string;
  athleteId: string;
  exerciseId: string;
  setData: CompletedSet;
  eventTimestamp: Date;
  createdAt: Date;
}

const CompletedSetSchema = new Schema<CompletedSet>(
  {
    setId: { type: String, required: true },
    setNumber: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    actualReps: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    rpe: { type: Number, required: false },
    isCompleted: { type: Boolean, required: true },
    loggedAt: { type: String, required: true },
  },
  { _id: false }
);

const SessionEventSchema = new Schema<ISessionEvent>(
  {
    _id: {
      type: String, // Client-generated RFC 4122 UUIDv4
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    athleteId: {
      type: String,
      required: true,
      index: true,
    },
    exerciseId: {
      type: String,
      required: true,
      index: true,
    },
    setData: {
      type: CompletedSetSchema,
      required: true,
    },
    eventTimestamp: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    _id: false,
  }
);

// Compound index following ESR: athleteId (Equality), sessionId (Equality), eventTimestamp (Sort)
SessionEventSchema.index({ athleteId: 1, sessionId: 1, eventTimestamp: -1 });

export const SessionEventModel: Model<ISessionEvent> = mongoose.model<ISessionEvent>(
  'SessionEvent',
  SessionEventSchema
);
