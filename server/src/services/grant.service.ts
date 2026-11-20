import { ScopedGrantModel, type IScopedGrant, type GrantScope } from '../models/scopedGrant.model.js';
import { NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { PassportFact, DigitalTwinSnapshot } from '@smackgym/shared';

export interface CreateGrantInput {
  coachId: string;
  scopes: GrantScope[];
  durationDays?: number;
}

export interface SanitizedPassportPayload {
  facts: PassportFact[];
  digitalTwin: DigitalTwinSnapshot & {
    fastingRedacted?: boolean;
    cycleRedacted?: boolean;
    pregnancyRedacted?: boolean;
    aiChatRedacted?: boolean;
  };
  activeGrants: GrantScope[];
  gdprArticle9Protected: boolean;
}

export class GrantService {
  /**
   * Issues or updates a granular UK GDPR Article 9 ScopedGrant from athlete to coach (Gate T13)
   */
  public async createGrant(athleteId: string, input: CreateGrantInput): Promise<IScopedGrant> {
    const expiresAt = input.durationDays
      ? new Date(Date.now() + input.durationDays * 86400000)
      : undefined;

    // Check if an existing grant exists between athlete and coach
    let grant = await ScopedGrantModel.findOne({ athleteId, coachId: input.coachId });
    if (grant) {
      grant.scopes = input.scopes;
      grant.isActive = true;
      grant.expiresAt = expiresAt;
      grant.revokedAt = undefined;
      await grant.save();
    } else {
      grant = await ScopedGrantModel.create({
        athleteId,
        coachId: input.coachId,
        scopes: input.scopes,
        isActive: true,
        expiresAt,
        grantedAt: new Date(),
      });
    }

    logger.info(`UK GDPR Article 9 ScopedGrant issued: Athlete ${athleteId} -> Coach ${input.coachId}`, {
      scopes: input.scopes,
    });

    return grant;
  }

  /**
   * Retrieves all grants issued by an athlete
   */
  public async getAthleteGrants(athleteId: string): Promise<any[]> {
    return await ScopedGrantModel.find({ athleteId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Revokes an existing ScopedGrant immediately (RULE-SEC-01, Gate T13)
   */
  public async revokeGrant(athleteId: string, grantId: string): Promise<IScopedGrant> {
    const grant = await ScopedGrantModel.findOne({ _id: grantId, athleteId });
    if (!grant) {
      throw new NotFoundError('ScopedGrant not found for this athlete');
    }

    grant.isActive = false;
    grant.revokedAt = new Date();
    await grant.save();

    logger.warn(`UK GDPR Article 9 ScopedGrant revoked: Athlete ${athleteId} revoked grant ${grantId}`);
    return grant;
  }

  /**
   * Resolves active scopes granted by athlete to a specific coach
   */
  public async resolveActiveScopes(athleteId: string, coachId: string): Promise<Set<GrantScope>> {
    const grant = await ScopedGrantModel.findOne({
      athleteId,
      coachId,
      isActive: true,
    });

    if (!grant) {
      return new Set();
    }

    // Check expiration if set
    if (grant.expiresAt && grant.expiresAt.getTime() < Date.now()) {
      grant.isActive = false;
      await grant.save();
      return new Set();
    }

    return new Set(grant.scopes);
  }

  /**
   * UK GDPR Article 9 Projection Firewall (RULE-PRIV-01, Gate T13)
   * Redacts faith (fasting), menstrual symptoms, pregnancy notes, and AI coaching chat
   * unless explicitly granted by the athlete.
   */
  public async applyArticle9Firewall(
    athleteId: string,
    coachId: string,
    rawFacts: PassportFact[],
    rawTwin: DigitalTwinSnapshot
  ): Promise<SanitizedPassportPayload> {
    const activeScopes = await this.resolveActiveScopes(athleteId, coachId);

    const hasFastingGrant = activeScopes.has('fasting_data');
    const hasCycleGrant = activeScopes.has('cycle_data');
    const hasPregnancyGrant = activeScopes.has('pregnancy_notes');
    const hasAiChatGrant = activeScopes.has('ai_chat');

    // 1. Sanitize Passport Facts
    const sanitizedFacts: PassportFact[] = rawFacts.map((fact) => {
      // Redact religious fasting / Ramadan facts if not explicitly granted
      if (fact.key === 'fasting_config' && !hasFastingGrant) {
        return {
          ...fact,
          value: {
            redacted: true,
            reason: 'REDACTED_GDPR_ARTICLE_9_NO_GRANT',
            category: 'religious_belief_special_category',
          },
        };
      }

      // Redact menstrual cycle / symptoms if not explicitly granted
      if (fact.key === 'menstrual_cycle_status' && !hasCycleGrant) {
        return {
          ...fact,
          value: {
            redacted: true,
            reason: 'REDACTED_GDPR_ARTICLE_9_NO_GRANT',
            category: 'health_biometric_special_category',
          },
        };
      }

      // Redact pregnancy notes if not granted
      if (fact.key === 'pregnancy_status' && !hasPregnancyGrant) {
        return {
          ...fact,
          value: {
            redacted: true,
            reason: 'REDACTED_GDPR_ARTICLE_9_NO_GRANT',
            category: 'health_clinical_special_category',
          },
        };
      }

      return fact;
    });

    // 2. Sanitize Compiled Digital Twin
    const sanitizedTwin = { ...rawTwin };

    if (!hasFastingGrant) {
      sanitizedTwin.isFastingRamadan = false;
      (sanitizedTwin as any).fastingRedacted = true;
    }

    if (!hasCycleGrant) {
      sanitizedTwin.menstrualPhase = undefined;
      (sanitizedTwin as any).cycleRedacted = true;
    }

    if (!hasPregnancyGrant) {
      (sanitizedTwin as any).pregnancyRedacted = true;
    }

    if (!hasAiChatGrant) {
      (sanitizedTwin as any).aiChatRedacted = true;
    }

    return {
      facts: sanitizedFacts,
      digitalTwin: sanitizedTwin,
      activeGrants: Array.from(activeScopes),
      gdprArticle9Protected: true,
    };
  }
}

export const grantService = new GrantService();
