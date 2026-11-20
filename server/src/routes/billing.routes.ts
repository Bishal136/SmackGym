import { Router } from 'express';
import { billingController } from '../controllers/billing.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Stripe Webhook Endpoint (processed idempotently via Redis)
router.post('/webhook', billingController.handleWebhook);

// User entitlement query (authenticated)
router.get('/subscription', requireAuth, billingController.getSubscription);

export const billingRouter = router;
