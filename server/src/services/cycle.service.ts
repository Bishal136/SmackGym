import { passportService } from './passport.service.js';
import { ADAPT_REASON_CODES } from '@smackgym/shared';

export type MenstrualPhase = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual';

export interface CycleLogInput {
  cycleDay: number; // 1-35
  phase?: MenstrualPhase;
  crampsSeverity?: number; // 1-5
  fatigueSeverity?: number; // 1-5
  overallSymptomSeverity: number; // 1-5
  notes?: string;
  loggedAt?: string;
}

export interface CycleStatusResult {
  userId: string;
  cycleDay: number;
  phase: MenstrualPhase;
  overallSymptomSeverity: number;
  deloadRecommended: boolean;
  volumeMultiplier: number; // e.g. 0.75 for 25% drop
  trainingRecommendation: string;
  adaptationReasonCode: string;
  loggedAt: string;
}

export class CycleService {
  /**
   * Automatically derives menstrual phase from cycle day if not explicitly supplied
   */
  private derivePhase(cycleDay: number): MenstrualPhase {
    if (cycleDay >= 1 && cycleDay <= 5) return 'menstrual';
    if (cycleDay >= 6 && cycleDay <= 13) return 'follicular';
    if (cycleDay >= 14 && cycleDay <= 16) return 'ovulatory';
    return 'luteal'; // Days 17-35
  }

  /**
   * Logs cycle metrics, computes load adaptations, and persists to athlete Passport (Gate T10)
   */
  public async logCycleData(userId: string, input: CycleLogInput): Promise<CycleStatusResult> {
    const phase = input.phase || this.derivePhase(input.cycleDay);
    const severity = input.overallSymptomSeverity;

    // Gate T10 logic: Deload automatically suggested during high-symptom luteal phase
    const isHighSymptomLuteal = phase === 'luteal' && severity >= 3;
    const isSevereMenstrual = phase === 'menstrual' && severity >= 4;

    const deloadRecommended = isHighSymptomLuteal || isSevereMenstrual;
    let volumeMultiplier = 1.0;
    let trainingRecommendation = 'Normal progressive overload capacity. High power threshold window.';
    let adaptationReasonCode = 'NONE';

    if (isHighSymptomLuteal) {
      volumeMultiplier = 0.75; // 25% volume drop
      trainingRecommendation =
        'High-symptom luteal phase detected. Deload recommended: volume compressed by 25% to minimize CNS strain.';
      adaptationReasonCode = ADAPT_REASON_CODES.MENSTRUAL_LUTEAL_FATIGUE;
    } else if (phase === 'menstrual') {
      volumeMultiplier = 0.85;
      trainingRecommendation = 'Menstrual phase: moderate volume with priority on recovery and joint comfort.';
    } else if (phase === 'ovulatory') {
      volumeMultiplier = 1.0;
      trainingRecommendation = 'Ovulatory phase: peak neuromuscular power potential.';
    }

    const result: CycleStatusResult = {
      userId,
      cycleDay: input.cycleDay,
      phase,
      overallSymptomSeverity: severity,
      deloadRecommended,
      volumeMultiplier,
      trainingRecommendation,
      adaptationReasonCode,
      loggedAt: input.loggedAt || new Date().toISOString(),
    };

    // Record fact in Passport under biometric_recovery
    await passportService.addOrUpdateFact(userId, {
      domain: 'biometric_recovery',
      key: 'menstrual_cycle_status',
      value: result,
      sourceKind: 'user_declared',
    });

    return result;
  }

  /**
   * Retrieves current menstrual status and load recommendation for an athlete
   */
  public async getCycleStatus(userId: string): Promise<CycleStatusResult | null> {
    const facts = await passportService.getUserFacts(userId);
    const fact = facts.find((f) => f.key === 'menstrual_cycle_status' && f.isActive);
    if (!fact) return null;
    return fact.value as CycleStatusResult;
  }
}

export const cycleService = new CycleService();
