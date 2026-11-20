import crypto from 'node:crypto';
import { PlanModel, type IPlan, type IPlanExercise } from '../models/plan.model.js';
import { ExerciseModel } from '../models/exercise.model.js';
import { passportService } from './passport.service.js';
import { ConcurrencyError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { getRedisClient } from '../config/redis.js';
import type {
  ActiveMedicalHold,
  TriggerSafetyHoldInput,
} from '@smackgym/shared';
import {
  ADAPT_REASON_CODES,
  SAFETY_HOLD_REASON_CODES,
} from '@smackgym/shared';

// Clinical mapping of affected body parts to restricted movement patterns
const RESTRICTIONS_MAP: Record<string, string[]> = {
  knee: ['squat', 'lunge'],
  lower_back: ['hinge', 'squat'],
  back: ['hinge', 'squat'],
  shoulder: ['push', 'overhead_press'],
  elbow: ['push', 'pull'],
  wrist: ['push'],
  ankle: ['squat', 'lunge', 'jump'],
};

export class DecisionEngineService {
  /**
   * Deterministic 6-step plan generation (Gate T05)
   */
  public async generatePlan(userId: string, targetDate: string): Promise<IPlan> {
    try {
      const redis = getRedisClient();
      const isAiKilled =
        (await redis.get('killswitch:GLOBAL_AI_KILL_SWITCH')) ||
        (await redis.get('killswitch:AI_CHAT'));
      if (isAiKilled === '1' || isAiKilled === 'true') {
        throw new ForbiddenError(
          'AI workout generation is temporarily disabled by global emergency kill switch',
          'ai_kill_switch_active'
        );
      }
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
      // Fail open if Redis is down
    }

    const digitalTwin = await passportService.compileDigitalTwin(userId);

    // 1. Gather all active restricted movement patterns from Medical Holds
    const restrictedPatterns = new Set<string>();
    for (const hold of digitalTwin.activeHolds) {
      for (const pattern of hold.restrictedMovements) {
        restrictedPatterns.add(pattern);
      }
    }

    // 2. Query available licensed exercises
    let availableExercises = await ExerciseModel.find({
      isLicensed: true,
    }).lean();

    // If no exercises seeded yet, provide canonical standard fallback exercises
    if (availableExercises.length === 0) {
      availableExercises = [
        {
          _id: 'EX-0001',
          name: 'Barbell Back Squat',
          movementPattern: 'squat',
          targetMuscles: ['quadriceps', 'glutes'],
          equipmentRequired: ['barbell', 'rack'],
          setupCues: ['Feet shoulder-width', 'Brace core'],
          videoAssetId: 'vid-squat-1',
          isLicensed: true,
          isCompound: true,
        },
        {
          _id: 'EX-0002',
          name: 'Barbell Romanian Deadlift',
          movementPattern: 'hinge',
          targetMuscles: ['hamstrings', 'glutes'],
          equipmentRequired: ['barbell'],
          setupCues: ['Hinge at hips', 'Keep spine neutral'],
          videoAssetId: 'vid-rdl-1',
          isLicensed: true,
          isCompound: true,
        },
        {
          _id: 'EX-0003',
          name: 'Dumbbell Bench Press',
          movementPattern: 'push',
          targetMuscles: ['pectorals', 'triceps'],
          equipmentRequired: ['dumbbell', 'bench'],
          setupCues: ['Retract scapulae', 'Drive through feet'],
          videoAssetId: 'vid-bench-1',
          isLicensed: true,
          isCompound: true,
        },
        {
          _id: 'EX-0004',
          name: 'Chest Supported Cable Row',
          movementPattern: 'pull',
          targetMuscles: ['latissimus_dorsi', 'rhomboids'],
          equipmentRequired: ['cable'],
          setupCues: ['Pull with elbows', 'Squeeze lats'],
          videoAssetId: 'vid-row-1',
          isLicensed: true,
          isCompound: false,
        },
      ] as any[];
    }

    // Filter exercises: exclude patterns restricted by medical holds & match equipment
    const selectedExercises: IPlanExercise[] = [];
    const rationaleCodes: string[] = [];

    // Check deload requirement from readiness score
    const isDeloadNeeded = digitalTwin.readinessScore < 50;
    if (isDeloadNeeded) {
      rationaleCodes.push(ADAPT_REASON_CODES.HIGH_SUBJECTIVE_FATIGUE);
    }

    // Fasting adaptation (Gate T09)
    if (digitalTwin.isFastingRamadan) {
      rationaleCodes.push(ADAPT_REASON_CODES.RAMADAN_FASTING_WINDOW);
    }

    // Menstrual cycle luteal adaptation (Gate T10)
    const isLutealDeload = digitalTwin.menstrualPhase === 'luteal';
    if (isLutealDeload) {
      rationaleCodes.push(ADAPT_REASON_CODES.MENSTRUAL_LUTEAL_FATIGUE);
    }

    const isVolumeDrop = isDeloadNeeded || digitalTwin.isFastingRamadan || isLutealDeload;

    for (const ex of availableExercises) {
      // Step 1: Medical hold filter
      if (restrictedPatterns.has(ex.movementPattern)) {
        continue;
      }

      // Step 3: Equipment filter
      const hasEquipment = ex.equipmentRequired.every((req: string) =>
        digitalTwin.availableEquipment.includes(req) || req === 'bodyweight'
      );
      if (!hasEquipment) {
        continue;
      }

      const sets = isVolumeDrop ? 2 : 3;
      const reps = isVolumeDrop ? 8 : 10;
      const weight = isVolumeDrop ? 40 : 60;

      selectedExercises.push({
        exerciseId: ex._id,
        name: ex.name,
        targetSets: sets,
        targetReps: reps,
        targetWeightKg: weight,
        restSeconds: 90,
        movementPattern: ex.movementPattern,
      });

      if (selectedExercises.length >= 4) break;
    }

    if (digitalTwin.activeHolds.length > 0) {
      rationaleCodes.push(ADAPT_REASON_CODES.SUBSTITUTION_TARGET_MATCH);
    }

    const plan = await PlanModel.create({
      userId,
      targetDate,
      exercises: selectedExercises,
      rationaleCodes,
      isRestricted: digitalTwin.activeHolds.length > 0,
      holdApplied: digitalTwin.activeHolds[0] || undefined,
      status: 'generated',
      revision: 1,
    });

    return plan;
  }

  /**
   * Adapts an existing plan with human-readable rationale codes
   */
  public async adaptPlan(
    userId: string,
    planId: string,
    reasonCode: string = ADAPT_REASON_CODES.EQUIPMENT_UNAVAILABLE
  ): Promise<IPlan> {
    const plan = await PlanModel.findOne({ _id: planId, userId });
    if (!plan) {
      throw new NotFoundError('Training plan not found');
    }

    // Substitute exercises or modify volume based on reasonCode
    const updatedExercises = plan.exercises.map((ex) => ({
      ...ex,
      targetSets: Math.max(1, ex.targetSets - 1), // Adjust volume safely
    }));

    plan.exercises = updatedExercises as any;
    if (!plan.rationaleCodes.includes(reasonCode)) {
      plan.rationaleCodes.push(reasonCode);
    }
    plan.status = 'adapted';
    plan.revision += 1;

    await plan.save();
    return plan;
  }

  /**
   * Optimistic Concurrency Control: Accept adapted plan (RULE-DB-03, Gate T04)
   */
  public async acceptPlan(
    userId: string,
    planId: string,
    expectedRevision: number
  ): Promise<IPlan> {
    const updated = await PlanModel.findOneAndUpdate(
      { _id: planId, userId, revision: expectedRevision },
      { $set: { status: 'accepted' }, $inc: { revision: 1 } },
      { new: true }
    );

    if (!updated) {
      throw new ConcurrencyError(
        'Plan was modified by another session or revision mismatch',
        'stale_revision'
      );
    }

    return updated;
  }

  /**
   * Non-bypassable "Something hurts" safety hold engine (RULE-SAFE-01, Gate T06)
   */
  public async triggerSafetyHold(
    userId: string,
    input: TriggerSafetyHoldInput
  ): Promise<ActiveMedicalHold> {
    const bodyPart = input.affectedBodyPart.toLowerCase().replace(/[^a-z_]/g, '');
    const restrictedMovements = RESTRICTIONS_MAP[bodyPart] || ['squat', 'hinge', 'push', 'lunge'];

    const holdId = crypto.randomUUID();
    const medicalHold: ActiveMedicalHold = {
      holdId,
      affectedBodyPart: input.affectedBodyPart,
      reasonCode: input.reasonCode || SAFETY_HOLD_REASON_CODES.SOMETHING_HURTS_SHARP_PAIN,
      declaredAt: new Date().toISOString(),
      restrictedMovements,
      isCleared: false,
    };

    // 1. Record atomic fact in athlete's Passport
    await passportService.addOrUpdateFact(userId, {
      domain: 'injury_restriction',
      key: `medical_hold_${holdId}`,
      value: medicalHold,
      sourceKind: 'user_declared',
    });

    // 2. Lock active plans: filter out restricted compound movements immediately
    const activePlans = await PlanModel.find({
      userId,
      status: { $in: ['generated', 'accepted', 'adapted'] },
    });

    for (const plan of activePlans) {
      plan.exercises = plan.exercises.filter(
        (ex) => !restrictedMovements.includes(ex.movementPattern)
      ) as any;
      plan.isRestricted = true;
      plan.holdApplied = medicalHold;
      plan.rationaleCodes.push(ADAPT_REASON_CODES.SUBSTITUTION_TARGET_MATCH);
      plan.revision += 1;
      await plan.save();
    }

    return medicalHold;
  }
}

export const decisionEngineService = new DecisionEngineService();
