import { Router } from 'express';
import { passportController } from '../controllers/passport.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/facts', passportController.getFacts);
router.post('/facts', passportController.createFact);
router.delete('/facts/:id', passportController.deleteFact);
router.get('/snapshot', passportController.getSnapshot);

export const passportRouter = router;
