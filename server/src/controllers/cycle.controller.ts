import type { Request, Response, NextFunction } from 'express';
import { cycleService, type CycleLogInput } from '../services/cycle.service.js';

export class CycleController {
  public async logCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await cycleService.logCycleData(userId, req.body as CycleLogInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await cycleService.getCycleStatus(userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const cycleController = new CycleController();
