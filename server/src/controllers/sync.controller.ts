import type { Request, Response, NextFunction } from 'express';
import { syncService } from '../services/sync.service.js';
import type { BatchSessionEventsInput } from '@smackgym/shared';

export class SyncController {
  public async ingestBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const athleteId = req.user!.userId;
      const { events } = req.body as BatchSessionEventsInput;
      const result = await syncService.ingestBatch(athleteId, events);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const syncController = new SyncController();
