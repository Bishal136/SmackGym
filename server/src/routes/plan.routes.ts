import { Router } from 'express';
import { planController } from '../controllers/plan.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { planAcceptSchema, triggerSafetyHoldSchema } from '@smackgym/shared';

const router = Router();

router.use(requireAuth);

router.post('/generate', planController.generatePlan);
router.post('/:id/adapt', planController.adaptPlan);
router.post('/accept', validateRequest({ body: planAcceptSchema }), planController.acceptPlan);

export const planRouter = router;
export const safetyRouter = Router();
safetyRouter.use(requireAuth);
safetyRouter.post('/holds', validateRequest({ body: triggerSafetyHoldSchema }), planController.triggerSafetyHold);
