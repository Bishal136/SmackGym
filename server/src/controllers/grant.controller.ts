import type { Request, Response, NextFunction } from 'express';
import { grantService, type CreateGrantInput } from '../services/grant.service.js';

export class GrantController {
  public async createGrant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const athleteId = req.user!.userId;
      const result = await grantService.createGrant(athleteId, req.body as CreateGrantInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getGrants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const athleteId = req.user!.userId;
      const result = await grantService.getAthleteGrants(athleteId);
      res.status(200).json({ success: true, data: result, count: result.length });
    } catch (err) {
      next(err);
    }
  }

  public async revokeGrant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const athleteId = req.user!.userId;
      const grantId = req.params.id as string;
      const result = await grantService.revokeGrant(athleteId, grantId);
      res.status(200).json({ success: true, data: result, message: 'ScopedGrant revoked successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const grantController = new GrantController();
