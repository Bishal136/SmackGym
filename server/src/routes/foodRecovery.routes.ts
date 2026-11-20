import { Router } from 'express';
import { foodRecoveryController } from '../controllers/foodRecovery.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { foodEntrySchema, recoveryCheckinSchema } from '@smackgym/shared';

export const foodRouter = Router();
foodRouter.use(requireAuth);
foodRouter.post('/entries', validateRequest({ body: foodEntrySchema }), foodRecoveryController.logFoodEntry);
foodRouter.get('/entries', foodRecoveryController.getFoodEntries);

export const recoveryRouter = Router();
recoveryRouter.use(requireAuth);
recoveryRouter.post('/checkins', validateRequest({ body: recoveryCheckinSchema }), foodRecoveryController.logRecoveryCheckin);
recoveryRouter.get('/latest', foodRecoveryController.getLatestRecovery);
