import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { ageGateMiddleware } from '../middlewares/ageGate.js';
import { unauthenticatedRateLimiter } from '../middlewares/rateLimiter.js';
import { requireAuth } from '../middlewares/auth.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '@smackgym/shared';

const router = Router();

/**
 * POST /v1/auth/register
 * Enforces 18+ gate, rate limit, validation, and records UK GDPR consent
 */
router.post(
  '/register',
  unauthenticatedRateLimiter,
  ageGateMiddleware,
  validateRequest({ body: registerSchema }),
  authController.register
);

/**
 * POST /v1/auth/login
 * Validates credentials via Argon2id and issues RS256 token pair
 */
router.post(
  '/login',
  unauthenticatedRateLimiter,
  validateRequest({ body: loginSchema }),
  authController.login
);

/**
 * POST /v1/auth/refresh
 * Rotates sliding refresh token stored in Redis and issues new access token
 */
router.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  authController.refreshToken
);

/**
 * POST /v1/auth/logout
 * Revokes current JWT access token via Redis blacklist and deletes refresh session
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * GET /v1/auth/me
 * Returns authenticated user's profile
 */
router.get('/me', requireAuth, authController.getMe);

export const authRouter = router;
