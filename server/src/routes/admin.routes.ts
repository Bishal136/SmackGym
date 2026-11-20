import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

const router = Router();

// Secure Super Administrator routes
router.use(requireAuth);
router.use(requireRole('SUPER_ADMIN'));

router.get('/kill-switches', adminController.getKillSwitches);
router.post('/kill-switches/:scope', adminController.setKillSwitch);

export const adminRouter = router;
