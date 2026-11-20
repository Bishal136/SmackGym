import { Router } from 'express';
import { fastingController } from '../controllers/fasting.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const fastingConfigSchema = z.object({
  isActive: z.boolean(),
  fastingType: z.enum(['RAMADAN', 'INTERMITTENT_FASTING']),
  fajrTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Fajr time must be in HH:mm format').optional(),
  maghribTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Maghrib time must be in HH:mm format').optional(),
  fastingStartHour: z.number().int().min(0).max(23).optional(),
  fastingEndHour: z.number().int().min(0).max(23).optional(),
});

const router = Router();

router.use(requireAuth);

router.post(
  '/config',
  validateRequest({ body: fastingConfigSchema }),
  fastingController.setConfig
);

router.get('/status', fastingController.getStatus);

export const fastingRouter = router;
