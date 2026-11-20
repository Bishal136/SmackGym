import { z } from 'zod';

export const completedSetSchema = z.object({
  setId: z.string().uuid('Set ID must be a valid RFC 4122 UUID'),
  setNumber: z.number().int().positive(),
  targetReps: z.number().int().nonnegative(),
  actualReps: z.number().int().nonnegative(),
  weightKg: z.number().nonnegative(),
  rpe: z.number().min(1).max(10).optional(),
  isCompleted: z.boolean(),
  loggedAt: z.string().datetime(),
});

export const sessionEventSchema = z.object({
  eventId: z.string().uuid('Event ID must be a valid RFC 4122 UUIDv4'),
  sessionId: z.string().min(1, 'Session ID is required'),
  athleteId: z.string().min(1, 'Athlete ID is required'),
  exerciseId: z.string().min(1, 'Exercise ID is required'),
  setData: completedSetSchema,
  eventTimestamp: z.string().datetime(),
});

export const batchSessionEventsSchema = z.object({
  events: z
    .array(sessionEventSchema)
    .min(1, 'At least one event must be submitted')
    .max(100, 'Batch limit is 100 events per request'),
});

export const triggerSafetyHoldSchema = z.object({
  affectedBodyPart: z.string().min(2).max(100),
  reasonCode: z.string().min(2).max(50),
  sessionId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const planAcceptSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  expectedRevision: z.number().int().positive('expectedRevision must be a positive integer'),
});

export type CompletedSetInput = z.infer<typeof completedSetSchema>;
export type SessionEventInput = z.infer<typeof sessionEventSchema>;
export type BatchSessionEventsInput = z.infer<typeof batchSessionEventsSchema>;
export type TriggerSafetyHoldInput = z.infer<typeof triggerSafetyHoldSchema>;
export type PlanAcceptInput = z.infer<typeof planAcceptSchema>;
