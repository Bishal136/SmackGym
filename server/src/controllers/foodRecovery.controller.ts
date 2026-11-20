import type { Request, Response, NextFunction } from 'express';
import { foodRecoveryService } from '../services/foodRecovery.service.js';
import type { FoodEntryInput, RecoveryCheckinInput } from '@smackgym/shared';

export class FoodRecoveryController {
  public async logFoodEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const entry = await foodRecoveryService.logFoodEntry(userId, req.body as FoodEntryInput);
      res.status(201).json({ success: true, data: entry });
    } catch (err) {
      next(err);
    }
  }

  public async getFoodEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const entries = await foodRecoveryService.getFoodEntries(userId);
      res.status(200).json({ success: true, data: entries });
    } catch (err) {
      next(err);
    }
  }

  public async logRecoveryCheckin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const checkin = await foodRecoveryService.logRecoveryCheckin(userId, req.body as RecoveryCheckinInput);
      res.status(201).json({ success: true, data: checkin });
    } catch (err) {
      next(err);
    }
  }

  public async getLatestRecovery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const recovery = await foodRecoveryService.getLatestRecovery(userId);
      res.status(200).json({ success: true, data: recovery });
    } catch (err) {
      next(err);
    }
  }
}

export const foodRecoveryController = new FoodRecoveryController();
