import { Router } from 'express';
import { syncController } from '../controllers/sync.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { batchSessionEventsSchema } from '@smackgym/shared';

const router = Router();

router.use(requireAuth);

router.post(
  '/batch',
  validateRequest({ body: batchSessionEventsSchema }),
  syncController.ingestBatch
);

export const syncRouter = router;
