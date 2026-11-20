import { Router } from 'express';
import { contentController } from '../controllers/content.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Public/authenticated exercise catalog
router.get('/exercises', contentController.getExercises);

// Stream token signing (requires authentication)
router.get('/content/:id/stream-token', requireAuth, contentController.getStreamToken);

export const contentRouter = router;
