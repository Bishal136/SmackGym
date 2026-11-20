import { Router } from 'express';
import { institutionController } from '../controllers/institution.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const createInstitutionSchema = z.object({
  name: z.string().min(3).max(150),
  domainPattern: z.string().min(3).optional(),
  totalSeats: z.number().int().min(1).default(500),
  samlEntityId: z.string().optional(),
});

const provisionBulkSchema = z.object({
  seatsToAdd: z.number().int().min(1).max(50000),
});

const samlSsoSchema = z.object({
  email: z.string().email(),
  fullName: z.string().optional(),
  institutionDomain: z.string().optional(),
  samlAssertionToken: z.string().optional(),
});

const router = Router();

// Public Enterprise SAML SSO assertion endpoint (Milestone M5)
router.post(
  '/sso/saml',
  validateRequest({ body: samlSsoSchema }),
  institutionController.samlSsoCallback
);

// Authenticated endpoints
router.use(requireAuth);

// Student-Athlete claim seat matching @*.ac.uk (Gate T14)
router.post('/claim-seat', institutionController.claimSeat);

// Read institution information
router.get('/', institutionController.list);
router.get('/:id', institutionController.getById);

// Admin-level institution management & bulk seat provisioning (Gate T14)
router.post(
  '/',
  requireRole('SUPER_ADMIN'),
  validateRequest({ body: createInstitutionSchema }),
  institutionController.create
);

router.post(
  '/:id/provision-bulk',
  requireRole('SUPER_ADMIN'),
  validateRequest({ body: provisionBulkSchema }),
  institutionController.provisionBulk
);

export const institutionRouter = router;
