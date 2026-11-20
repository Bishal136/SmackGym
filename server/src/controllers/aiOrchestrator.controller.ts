import type { Request, Response, NextFunction } from 'express';
import { aiOrchestratorService, type AskAIInput } from '../services/aiOrchestrator.service.js';

export class AIOrchestratorController {
  public async ask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await aiOrchestratorService.askAI(userId, req.body as AskAIInput);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const aiOrchestratorController = new AIOrchestratorController();
