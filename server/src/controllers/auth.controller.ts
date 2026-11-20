import type { Request, Response, NextFunction } from 'express';
import { authService, type RequestMetadata } from '../services/auth.service.js';
import type { RegisterInput, LoginInput, RefreshTokenInput } from '@smackgym/shared';

function extractMetadata(req: Request): RequestMetadata {
  return {
    ipAddress: req.ip || req.socket.remoteAddress || 'unknown-ip',
    userAgent: req.header('user-agent') || 'unknown-agent',
  };
}

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meta = extractMetadata(req);
      const result = await authService.register(req.body as RegisterInput, meta);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const meta = extractMetadata(req);
      const result = await authService.login(req.body as LoginInput, meta);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as RefreshTokenInput;
      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const authHeader = req.header('Authorization');
      const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
      const refreshToken = (req.body as any)?.refreshToken;

      await authService.logout(userId, accessToken, refreshToken);
      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const profile = await authService.getMe(userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
