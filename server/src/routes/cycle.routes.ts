import { Router } from 'express';
import { cycleController } from '../controllers/cycle.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const cycleLogSchema = z.object({
  cycleDay: z.number().int().min(1).max(35),
  phase: z.enum(['follicular', 'ovulatory', 'luteal', 'menstrual']).optional(),
  crampsSeverity: z.number().int().min(1).max(5).optional(),
  fatigueSeverity: z.number().int().min(1).max(5).optional(),
  overallSymptomSeverity: z.number().int().min(1).max(5),
  notes: z.string().max(500).optional(),
  loggedAt: z.string().datetime().optional(),
});

const router = Router();

router.use(requireAuth);

router.post(
  '/log',
  validateRequest({ body: cycleLogSchema }),
  cycleController.logCycle
);

router.get('/status', cycleController.getStatus);

export const cycleRouter = router;
