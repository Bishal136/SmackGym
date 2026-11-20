import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import type { UserRole } from '@smackgym/shared';
import { UnauthorizedError } from './errors.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  is18Plus: boolean;
  jti: string;
}

export interface DecodedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
}

/**
 * Sign an asymmetric RS256 JWT access token with 15-minute expiry
 */
export function signAccessToken(payload: {
  userId: string;
  email: string;
  role: UserRole;
  is18Plus: boolean;
}): { token: string; jti: string; expiresIn: number } {
  const jti = crypto.randomUUID();
  const signOptions: SignOptions = {
    algorithm: 'RS256',
    expiresIn: env.JWT_ACCESS_EXPIRY as any,
    issuer: 'smackgym-auth-service',
    audience: 'smackgym-api',
  };

  const tokenPayload = {
    sub: payload.userId,
    email: payload.email,
    role: payload.role,
    is18Plus: payload.is18Plus,
    jti,
  };

  const token = jwt.sign(tokenPayload, env.JWT_ACCESS_PRIVATE_KEY, signOptions);
  // Default 15m in seconds = 900
  const expiresIn = 900;

  return { token, jti, expiresIn };
}

/**
 * Verify an asymmetric RS256 JWT access token
 */
export function verifyAccessToken(token: string): DecodedAccessToken {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: 'smackgym-auth-service',
      audience: 'smackgym-api',
    }) as DecodedAccessToken;

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token has expired', 'token_expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid access token signature', 'invalid_token');
    }
    throw new UnauthorizedError('Token verification failed', 'invalid_token');
  }
}

/**
 * Generate a cryptographically secure random refresh token (opaque string)
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Compute SHA-256 hash of a token for secure Redis storage/lookup
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
