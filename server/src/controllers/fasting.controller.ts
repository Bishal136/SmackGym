import type { Request, Response, NextFunction } from 'express';
import { fastingService, type FastingConfig } from '../services/fasting.service.js';

export class FastingController {
  public async setConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await fastingService.setFastingConfig(userId, req.body as FastingConfig);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await fastingService.getFastingStatus(userId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const fastingController = new FastingController();
