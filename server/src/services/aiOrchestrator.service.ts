import { llmAdapter } from '../adapters/llm.adapter.js';
import { passportService } from './passport.service.js';
import { getRedisClient } from '../config/redis.js';
import { ForbiddenError, TooManyRequestsError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface AskAIInput {
  prompt: string;
  contextExerciseId?: string;
  simulateDelayMs?: number; // for Gate T12 testing
}

export interface AskAIResult {
  content: string;
  fallbackApplied: boolean;
  model: string;
  tokensUsed: number;
  durationMs: number;
  clinicalAlert?: boolean;
  emergencyResources?: string[];
}

const EATING_DISORDER_REGEX = /(purge|laxative|starve|vomit|anorexi|bulimi|throw up after eating|skip all meals)/i;
const SELF_HARM_REGEX = /(suicide|kill myself|cut myself|end my life|want to die|hurt myself)/i;
const DAILY_TOKEN_BUDGET = 5000;

export class AIOrchestratorService {
  /**
   * Orchestrates natural language athlete coaching advice with clinical triage & 10s fallback (Gate T12)
   */
  public async askAI(userId: string, input: AskAIInput): Promise<AskAIResult> {
    const startTime = Date.now();

    // 1. Safety Kill Switch: Check Redis emergency switch (Gate T08)
    const redis = getRedisClient();
    const isAiKilled =
      (await redis.get('killswitch:GLOBAL_AI_KILL_SWITCH')) ||
      (await redis.get('killswitch:AI_CHAT'));
    if (isAiKilled === '1' || isAiKilled === 'true') {
      throw new ForbiddenError(
        'AI coaching is temporarily disabled by global emergency kill switch',
        'ai_kill_switch_active'
      );
    }

    // 2. Clinical Red-Flag Prompt Filter (PRD-AI-02)
    const prompt = input.prompt.trim();
    if (EATING_DISORDER_REGEX.test(prompt) || SELF_HARM_REGEX.test(prompt)) {
      logger.warn(`Clinical red-flag keyword detected in user prompt`, { userId });
      return {
        content:
          'Your safety and health are our highest priority. We detected language concerning physical distress, ' +
          'eating disorders, or self-harm. Please contact a professional healthcare provider or reach out to ' +
          'Beat Eating Disorders (UK: 0808 801 0677) or Samaritans (116 123) for immediate confidential support.',
        fallbackApplied: false,
        model: 'clinical-safety-triage-v1',
        tokensUsed: 0,
        durationMs: Date.now() - startTime,
        clinicalAlert: true,
        emergencyResources: [
          'Beat Eating Disorders: 0808 801 0677',
          'Samaritans 24/7 Helpline: 116 123',
          'NHS Emergency: 111 / 999',
        ],
      };
    }

    // 3. User Daily Token Budget Tracking in Redis (5,000 tokens/day cap)
    const today = new Date().toISOString().split('T')[0];
    const budgetKey = `ai:budget:${userId}:${today}`;
    const currentUsageStr = await redis.get(budgetKey);
    const currentUsage = currentUsageStr ? parseInt(currentUsageStr, 10) : 0;

    if (currentUsage >= DAILY_TOKEN_BUDGET) {
      throw new TooManyRequestsError(
        `Daily AI coaching token budget exceeded (${currentUsage}/${DAILY_TOKEN_BUDGET} tokens). Resets at midnight UTC.`,
        'token_budget_exceeded'
      );
    }

    // 4. Retrieve athlete Digital Twin context
    const digitalTwin = await passportService.compileDigitalTwin(userId);
    const contextSummary = `Readiness: ${digitalTwin.readinessScore}/100, Holds: ${digitalTwin.activeHolds.length}, Fasting: ${digitalTwin.isFastingRamadan}`;

    // 5. Hard 10-Second Fallback Circuit Breaker (RULE-SAFE-02, Gate T12)
    const timeoutPromise = new Promise<{ isTimeout: true }>((resolve) => {
      setTimeout(() => resolve({ isTimeout: true }), 10000);
    });

    const llmPromise = llmAdapter
      .generateAdvice(prompt, contextSummary, input.simulateDelayMs || 0)
      .then((res) => ({ isTimeout: false, data: res }));

    const outcome = await Promise.race([llmPromise, timeoutPromise]);
    const durationMs = Date.now() - startTime;

    if (outcome.isTimeout) {
      logger.warn(`LLM response timed out after ${durationMs}ms. Applying deterministic fallback.`, { userId });
      return {
        content:
          `[Rule-Based Fallback] Due to upstream network latency, your coaching adjustment was generated ` +
          `directly by the deterministic SMACKGYM Decision Engine: Maintain planned rest intervals (90s) and target RPE 8. ` +
          `Context: ${contextSummary}.`,
        fallbackApplied: true,
        model: 'deterministic-decision-engine-fallback',
        tokensUsed: 50,
        durationMs,
      };
    }

    // 6. Record token usage in Redis with 48h TTL
    const tokensUsed = outcome.data.tokensUsed;
    await redis.incrby(budgetKey, tokensUsed);
    await redis.expire(budgetKey, 172800);

    return {
      content: outcome.data.content,
      fallbackApplied: false,
      model: outcome.data.model,
      tokensUsed,
      durationMs,
    };
  }
}

export const aiOrchestratorService = new AIOrchestratorService();
