import type { Request, Response, NextFunction } from 'express';
import { researchService, type IngestResearchInput } from '../services/research.service.js';

export class ResearchController {
  public async ingestStudy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await researchService.ingestStudy(req.body as IngestResearchInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { exerciseId, query } = req.query;
      const result = await researchService.getResearchCards(
        exerciseId as string | undefined,
        query as string | undefined
      );
      res.status(200).json({ success: true, data: result, count: result.length });
    } catch (err) {
      next(err);
    }
  }
}

export const researchController = new ResearchController();
