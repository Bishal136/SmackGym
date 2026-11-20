import { z } from 'zod';

export const foodEntrySchema = z.object({
  mealName: z.string().trim().min(1, 'Meal name is required').max(100),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'suhoor', 'iftar']),
  calories: z.number().nonnegative().nullable().optional(),
  proteinGrams: z.number().nonnegative().nullable().optional(),
  carbsGrams: z.number().nonnegative().nullable().optional(),
  fatGrams: z.number().nonnegative().nullable().optional(),
  hydrationMl: z.number().nonnegative().nullable().optional(),
  loggedAt: z.string().datetime(),
});

export const recoveryCheckinSchema = z.object({
  sleepQuality: z.number().int().min(1).max(5),
  sorenessLevel: z.number().int().min(1).max(5),
  energyLevel: z.number().int().min(1).max(5),
  stressLevel: z.number().int().min(1).max(5),
  menstrualSymptoms: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().datetime(),
});

export type FoodEntryInput = z.infer<typeof foodEntrySchema>;
export type RecoveryCheckinInput = z.infer<typeof recoveryCheckinSchema>;
