import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type DecodedAccessToken } from '../utils/jwt.js';
import { getRedisClient } from '../config/redis.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { UserRole } from '@smackgym/shared';
import { logger } from '../utils/logger.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  is18Plus: boolean;
  jti: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware: verifies RS256 JWT access token and checks Redis blacklist.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return next(new UnauthorizedError('Bearer token is empty'));
  }

  try {
    const decoded: DecodedAccessToken = verifyAccessToken(token);

    // Check Redis revocation blacklist
    try {
      const redis = getRedisClient();
      const isBlacklisted = await redis.get(`bl:token:${decoded.jti}`);
      if (isBlacklisted) {
        return next(new UnauthorizedError('Token has been revoked', 'token_revoked'));
      }
    } catch (redisErr: any) {
      logger.error('Redis token blacklist check failed', { error: redisErr.message });
      // Proceed if Redis query fails in dev or handle according to security policy
    }

    req.user = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      is18Plus: decoded.is18Plus,
      jti: decoded.jti,
    };

    next();
  } catch (err: any) {
    next(err);
  }
}

/**
 * Role-Based Access Control (RBAC) middleware generator
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized for this resource`,
          'insufficient_permissions'
        )
      );
    }

    next();
  };
}
