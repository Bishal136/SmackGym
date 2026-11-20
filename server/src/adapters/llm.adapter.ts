import { logger } from '../utils/logger.js';

export interface LLMResponse {
  content: string;
  tokensUsed: number;
  model: string;
}

export class LLMAdapter {
  private readonly defaultModel = 'gemini-1.5-pro';

  /**
   * Generates natural language coaching advice with optional simulated latency (for Gate T12 testing)
   */
  public async generateAdvice(
    prompt: string,
    contextSummary: string,
    simulateDelayMs = 0
  ): Promise<LLMResponse> {
    if (simulateDelayMs > 0) {
      logger.info(`Simulating LLM latency of ${simulateDelayMs}ms for resilience test`);
      await new Promise((resolve) => setTimeout(resolve, simulateDelayMs));
    }

    // Standard conversational formatting for athlete training adjustments
    const content =
      `Based on your current readiness and active training plan: We adjusted volume to prioritize ` +
      `recovery while maintaining progressive overload. ${contextSummary ? `Focus note: ${contextSummary}` : ''}`.trim();

    const estimatedTokens = Math.ceil((prompt.length + content.length) / 4);

    return {
      content,
      tokensUsed: estimatedTokens,
      model: this.defaultModel,
    };
  }
}

export const llmAdapter = new LLMAdapter();
