import type { Request, Response, NextFunction } from 'express';
import { coachService, type AssignAthleteInput, type CreateGroupInput, type CreateProgramInput, type AdjustPlanInput } from '../services/coach.service.js';

export class CoachController {
  public async assignAthlete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const result = await coachService.assignAthlete(coachId, req.body as AssignAthleteInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const result = await coachService.getRoster(coachId);
      res.status(200).json({ success: true, data: result, count: result.length });
    } catch (err) {
      next(err);
    }
  }

  public async removeAthlete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const athleteId = req.params.athleteId as string;
      await coachService.removeAthlete(coachId, athleteId);
      res.status(200).json({ success: true, message: 'Athlete removed from roster' });
    } catch (err) {
      next(err);
    }
  }

  public async createGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const result = await coachService.createGroup(coachId, req.body as CreateGroupInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getGroups(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const result = await coachService.getGroups(coachId);
      res.status(200).json({ success: true, data: result, count: result.length });
    } catch (err) {
      next(err);
    }
  }

  public async addAthleteToGroup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const groupId = req.params.id as string;
      const { athleteId } = req.body;
      const result = await coachService.addAthleteToGroup(coachId, groupId, athleteId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async createProgram(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const result = await coachService.createProgram(coachId, req.body as CreateProgramInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getPrograms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const result = await coachService.getPrograms(coachId);
      res.status(200).json({ success: true, data: result, count: result.length });
    } catch (err) {
      next(err);
    }
  }

  public async adjustAthletePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const athleteId = req.params.athleteId as string;
      const planId = req.params.planId as string;
      const result = await coachService.adjustAthletePlan(coachId, athleteId, planId, req.body as AdjustPlanInput);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getAdjustmentAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const athleteId = req.params.athleteId as string;
      const planId = req.params.planId as string;
      const result = await coachService.getAdjustmentAuditLogs(athleteId, planId);
      res.status(200).json({ success: true, data: result, count: result.length });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Coach inspects athlete passport with UK GDPR Article 9 Firewall applied (Gate T13)
   */
  public async getAthletePassport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const athleteId = req.params.athleteId as string;
      const result = await coachService.getAthletePassport(coachId, athleteId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const coachController = new CoachController();
