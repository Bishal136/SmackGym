import type { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';

export class AdminController {
  public async getKillSwitches(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const switches = await adminService.getKillSwitches();
      res.status(200).json({ success: true, data: switches });
    } catch (err) {
      next(err);
    }
  }

  public async setKillSwitch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scope = req.params.scope as string;
      const { enabled } = req.body;
      const isEnabled = enabled === true || enabled === 'true' || enabled === 1;
      const result = await adminService.setKillSwitch(scope, isEnabled);
      res.status(200).json({
        success: true,
        data: { scope, enabled: result, message: `Kill switch '${scope}' set to ${result}` },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
