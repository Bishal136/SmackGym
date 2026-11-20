import type { Request, Response, NextFunction } from 'express';
import { contentService } from '../services/content.service.js';

export class ContentController {
  public async getExercises(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const exercises = await contentService.getExercises();
      res.status(200).json({ success: true, data: exercises });
    } catch (err) {
      next(err);
    }
  }

  public async getStreamToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const streamToken = await contentService.getStreamToken(id);
      res.status(200).json({ success: true, data: streamToken });
    } catch (err) {
      next(err);
    }
  }
}

export const contentController = new ContentController();
