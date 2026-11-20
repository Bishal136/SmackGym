import { Router } from 'express';
import { grantController } from '../controllers/grant.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const createGrantSchema = z.object({
  coachId: z.string().min(1, 'coachId is required'),
  scopes: z.array(
    z.enum([
      'training_logs',
      'recovery_scores',
      'fasting_data',
      'cycle_data',
      'pregnancy_notes',
      'ai_chat',
    ])
  ).min(1, 'At least one grant scope must be specified'),
  durationDays: z.number().int().min(1).max(365).optional(),
});

const router = Router();

router.use(requireAuth);

router.post(
  '/',
  validateRequest({ body: createGrantSchema }),
  grantController.createGrant
);

router.get('/', grantController.getGrants);

router.delete('/:id', grantController.revokeGrant);

export const grantRouter = router;
