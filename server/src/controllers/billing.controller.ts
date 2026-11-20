import type { Request, Response, NextFunction } from 'express';
import { billingService, type StripeWebhookEvent } from '../services/billing.service.js';

export class BillingController {
  public async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = req.body as StripeWebhookEvent;
      const result = await billingService.processWebhookEvent(event);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public async getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const subscription = await billingService.getSubscription(userId);
      res.status(200).json({ success: true, data: subscription || { tier: 'free', status: 'active' } });
    } catch (err) {
      next(err);
    }
  }
}

export const billingController = new BillingController();
