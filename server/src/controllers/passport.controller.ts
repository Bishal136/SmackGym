import type { Request, Response, NextFunction } from 'express';
import { passportService } from '../services/passport.service.js';

export class PassportController {
  public async getFacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const facts = await passportService.getUserFacts(userId);
      res.status(200).json({ success: true, data: facts });
    } catch (err) {
      next(err);
    }
  }

  public async createFact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const fact = await passportService.addOrUpdateFact(userId, req.body);
      res.status(201).json({ success: true, data: fact });
    } catch (err) {
      next(err);
    }
  }

  public async deleteFact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      await passportService.deleteFact(userId, id);
      res.status(200).json({ success: true, data: { message: 'Fact deactivated successfully' } });
    } catch (err) {
      next(err);
    }
  }

  public async getSnapshot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const snapshot = await passportService.compileDigitalTwin(userId);
      res.status(200).json({ success: true, data: snapshot });
    } catch (err) {
      next(err);
    }
  }
}

export const passportController = new PassportController();
