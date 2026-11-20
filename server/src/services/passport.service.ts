import { PassportFactModel } from '../models/passportFact.model.js';
import { RecoveryCheckinModel } from '../models/recoveryCheckin.model.js';
import { NotFoundError } from '../utils/errors.js';
import type {
  PassportFact,
  DigitalTwinSnapshot,
  ActiveMedicalHold,
  FactDomain,
  FactSourceKind,
} from '@smackgym/shared';

export interface CreateFactInput {
  domain: FactDomain;
  key: string;
  value: any;
  sourceKind?: FactSourceKind;
}

export class PassportService {
  /**
   * Retrieves all active passport facts for an athlete
   */
  public async getUserFacts(userId: string): Promise<PassportFact[]> {
    const docs = await PassportFactModel.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc: any) => ({
      id: doc._id,
      userId: doc.userId,
      domain: doc.domain,
      key: doc.key,
      value: doc.value,
      sourceKind: doc.sourceKind,
      isActive: doc.isActive,
      revision: doc.revision,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    }));
  }

  /**
   * Creates or updates an individual atomic fact
   */
  public async addOrUpdateFact(userId: string, input: CreateFactInput): Promise<PassportFact> {
    const existing = await PassportFactModel.findOne({
      userId,
      key: input.key,
      isActive: true,
    });

    if (existing) {
      existing.value = input.value;
      existing.domain = input.domain;
      existing.revision += 1;
      if (input.sourceKind) existing.sourceKind = input.sourceKind;
      await existing.save();
      return existing.toFact();
    }

    const created = await PassportFactModel.create({
      userId,
      domain: input.domain,
      key: input.key,
      value: input.value,
      sourceKind: input.sourceKind || 'user_declared',
      isActive: true,
      revision: 1,
    });

    return created.toFact();
  }

  /**
   * Deactivates a personal fact (user memory control PRD-PASS-02)
   */
  public async deleteFact(userId: string, factId: string): Promise<void> {
    const updated = await PassportFactModel.findOneAndUpdate(
      { _id: factId, userId, isActive: true },
      { $set: { isActive: false }, $inc: { revision: 1 } },
      { new: true }
    );

    if (!updated) {
      throw new NotFoundError('Passport fact not found or already deleted');
    }
  }

  /**
   * Compiles consolidated DigitalTwinSnapshot consumed by Decision Engine
   */
  public async compileDigitalTwin(userId: string): Promise<DigitalTwinSnapshot> {
    const facts = await PassportFactModel.find({ userId, isActive: true }).lean();

    // 1. Available Equipment
    const equipmentFact = facts.find((f) => f.key === 'available_equipment');
    const availableEquipment: string[] = equipmentFact?.value
      ? Array.isArray(equipmentFact.value)
        ? equipmentFact.value
        : [equipmentFact.value]
      : ['barbell', 'dumbbell', 'cable', 'bodyweight', 'bench', 'rack'];

    // 2. Active Medical Holds
    const holdFacts = facts.filter((f) => f.domain === 'injury_restriction' && f.value?.isCleared === false);
    const activeHolds: ActiveMedicalHold[] = holdFacts.map((f) => f.value as ActiveMedicalHold);

    // 3. Training Preferences & Constraints
    const scheduleFact = facts.find((f) => f.key === 'training_days_per_week');
    const trainingDaysPerWeek = typeof scheduleFact?.value === 'number' ? scheduleFact.value : 4;

    const durationFact = facts.find((f) => f.key === 'session_duration_minutes');
    const sessionDurationMinutes = typeof durationFact?.value === 'number' ? durationFact.value : 60;

    // 4. Latest Recovery Check-in
    const latestCheckin = await RecoveryCheckinModel.findOne({ userId })
      .sort({ loggedAt: -1 })
      .lean();
    const readinessScore = latestCheckin?.readinessScore ?? 80;

    // 5. Fasting Mode Fact (Gate T09)
    const fastingFact = facts.find((f) => f.key === 'fasting_config' && f.isActive);
    const isFastingRamadan = fastingFact?.value?.isActive === true;

    // 6. Menstrual Cycle Fact (Gate T10)
    const cycleFact = facts.find((f) => f.key === 'menstrual_cycle_status' && f.isActive);
    const menstrualPhase = cycleFact?.value?.phase;

    return {
      userId,
      compiledAt: new Date().toISOString(),
      availableEquipment,
      activeHolds,
      trainingDaysPerWeek,
      sessionDurationMinutes,
      readinessScore,
      isFastingRamadan,
      menstrualPhase,
    };
  }
}

export const passportService = new PassportService();
