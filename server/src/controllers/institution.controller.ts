import type { Request, Response, NextFunction } from 'express';
import { institutionService, type CreateInstitutionInput, type SamlSsoInput } from '../services/institution.service.js';

export class InstitutionController {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await institutionService.createInstitution(req.body as CreateInstitutionInput);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await institutionService.listInstitutions();
      res.status(200).json({ success: true, data: result, count: result.length });
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await institutionService.getInstitution(id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Enterprise Bulk Seat Provisioning (Gate T14)
   * Provisions 500 active university seats for @*.ac.uk
   */
  public async provisionBulk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { seatsToAdd } = req.body;
      const result = await institutionService.provisionBulkSeats(id, Number(seatsToAdd));
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Student-Athlete Seat Claim (Gate T14)
   */
  public async claimSeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userEmail = req.user!.email;
      const result = await institutionService.claimSeat(userId, userEmail);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Enterprise SAML 2.0 / OIDC SSO Authentication Stub (Milestone M5)
   */
  public async samlSsoCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await institutionService.handleSamlSso(req.body as SamlSsoInput);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const institutionController = new InstitutionController();
