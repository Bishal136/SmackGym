import { Router } from 'express';
import { aiOrchestratorController } from '../controllers/aiOrchestrator.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const askAISchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(2000),
  contextExerciseId: z.string().optional(),
  simulateDelayMs: z.number().int().min(0).max(30000).optional(),
});

const router = Router();

router.use(requireAuth);

router.post(
  '/ask',
  validateRequest({ body: askAISchema }),
  aiOrchestratorController.ask
);

export const aiRouter = router;
