import type { Request, Response, NextFunction } from 'express';
import { decisionEngineService } from '../services/decisionEngine.service.js';
import type { PlanAcceptInput, TriggerSafetyHoldInput } from '@smackgym/shared';

export class PlanController {
  public async generatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const targetDate = req.body.targetDate || new Date().toISOString().split('T')[0];
      const plan = await decisionEngineService.generatePlan(userId, targetDate);
      res.status(201).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  public async adaptPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const reasonCode = req.body.reasonCode;
      const plan = await decisionEngineService.adaptPlan(userId, id, reasonCode);
      res.status(200).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  public async acceptPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { planId, expectedRevision } = req.body as PlanAcceptInput;
      const plan = await decisionEngineService.acceptPlan(userId, planId, expectedRevision);
      res.status(200).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  public async triggerSafetyHold(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const hold = await decisionEngineService.triggerSafetyHold(userId, req.body as TriggerSafetyHoldInput);
      res.status(200).json({ success: true, data: hold });
    } catch (err) {
      next(err);
    }
  }
}

export const planController = new PlanController();
