import { FoodEntryModel, type IFoodEntry } from '../models/foodEntry.model.js';
import { RecoveryCheckinModel, type IRecoveryCheckin } from '../models/recoveryCheckin.model.js';
import type { FoodEntryInput, RecoveryCheckinInput } from '@smackgym/shared';

export class FoodRecoveryService {
  /**
   * Log manual nutrition entry (null-safe calorie and macronutrient storage PRD-FOOD-01)
   */
  public async logFoodEntry(userId: string, input: FoodEntryInput): Promise<IFoodEntry> {
    return await FoodEntryModel.create({
      userId,
      mealName: input.mealName,
      mealType: input.mealType,
      calories: input.calories ?? null,
      proteinGrams: input.proteinGrams ?? null,
      carbsGrams: input.carbsGrams ?? null,
      fatGrams: input.fatGrams ?? null,
      hydrationMl: input.hydrationMl ?? null,
      loggedAt: new Date(input.loggedAt),
    });
  }

  /**
   * Query food entries for user
   */
  public async getFoodEntries(userId: string): Promise<any[]> {
    return await FoodEntryModel.find({ userId }).sort({ loggedAt: -1 }).lean();
  }

  /**
   * Log morning recovery check-in and compute 0-100 Daily Readiness Index (PRD-REC-01)
   */
  public async logRecoveryCheckin(
    userId: string,
    input: RecoveryCheckinInput
  ): Promise<IRecoveryCheckin> {
    // Normalization: Higher sleep & energy boost score; higher soreness & stress reduce score.
    // Normalized component weights:
    // sleepQuality: 1-5 (direct)
    // sorenessLevel: 1-5 (inverted: 6 - soreness)
    // energyLevel: 1-5 (direct)
    // stressLevel: 1-5 (inverted: 6 - stress)
    const effectiveSoreness = 6 - input.sorenessLevel;
    const effectiveStress = 6 - input.stressLevel;
    const totalComponents = input.sleepQuality + effectiveSoreness + input.energyLevel + effectiveStress;
    const maxPossible = 20; // 4 * 5
    const readinessScore = Math.round((totalComponents / maxPossible) * 100);

    return await RecoveryCheckinModel.create({
      userId,
      sleepQuality: input.sleepQuality,
      sorenessLevel: input.sorenessLevel,
      energyLevel: input.energyLevel,
      stressLevel: input.stressLevel,
      menstrualSymptoms: input.menstrualSymptoms ?? null,
      notes: input.notes ?? null,
      readinessScore,
      loggedAt: new Date(input.loggedAt),
    });
  }

  /**
   * Retrieve latest recovery score
   */
  public async getLatestRecovery(userId: string): Promise<any> {
    return await RecoveryCheckinModel.findOne({ userId }).sort({ loggedAt: -1 }).lean();
  }
}

export const foodRecoveryService = new FoodRecoveryService();
