import type { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { getRedisClient } from '../config/redis.js';
import { TooManyRequestsError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  prefix?: string;
}

/**
 * Creates a Redis-backed sliding window rate limiter middleware.
 * Uses Redis Sorted Sets (ZSET) to track timestamped request entries.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    max,
    keyGenerator = (req: Request) => req.ip || req.socket.remoteAddress || 'unknown-ip',
    prefix = 'rl',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const identifier = keyGenerator(req);
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    const clearBefore = now - windowMs;
    const windowSec = Math.ceil(windowMs / 1000);

    try {
      const redis = getRedisClient();

      const pipeline = redis.pipeline();
      // 1. Remove expired timestamps outside the sliding window
      pipeline.zremrangebyscore(key, 0, clearBefore);
      // 2. Add current request timestamp with unique member
      pipeline.zadd(key, now, `${now}:${crypto.randomUUID()}`);
      // 3. Count total active requests in the current window
      pipeline.zcard(key);
      // 4. Set TTL on the key to automatically expire abandoned keys
      pipeline.expire(key, windowSec);

      const results = await pipeline.exec();

      if (!results) {
        return next();
      }

      // results[2] corresponds to zcard
      const [zcardErr, currentCount] = results[2] as [Error | null, number];
      if (zcardErr) {
        logger.error('Rate limiter Redis zcard error', { error: zcardErr.message });
        return next();
      }

      const remaining = Math.max(0, max - currentCount);
      const resetTime = Math.ceil((now + windowMs) / 1000);

      res.setHeader('RateLimit-Limit', max);
      res.setHeader('RateLimit-Remaining', remaining);
      res.setHeader('RateLimit-Reset', resetTime);

      if (currentCount > max) {
        const retryAfter = Math.ceil(windowMs / 1000);
        res.setHeader('Retry-After', retryAfter);
        return next(
          new TooManyRequestsError(
            `Rate limit exceeded: maximum ${max} requests per ${windowSec} seconds.`
          )
        );
      }

      next();
    } catch (err: any) {
      // Fail open if Redis is down, but log warning
      logger.warn('Rate limiter fell back due to error', { error: err.message, key });
      next();
    }
  };
}

/**
 * Unauthenticated endpoints limiter: 10 requests per minute per IP in production,
 * higher in development/testing for automated test runners.
 * (Login, Register)
 */
export const unauthenticatedRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
  prefix: 'rl:unauth',
  keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown-client',
});

/**
 * Authenticated API limiter: 300 requests per minute per User ID (or IP fallback)
 */
export const authenticatedRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 300,
  prefix: 'rl:auth',
  keyGenerator: (req) => ((req as any).user?.userId) || req.ip || 'unknown-client',
});
