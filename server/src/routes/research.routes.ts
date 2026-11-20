import { Router } from 'express';
import { researchController } from '../controllers/research.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const ingestStudySchema = z.object({
  targetUrl: z.string().url('targetUrl must be a valid URL'),
  source: z.enum(['pubmed', 'crossref', 'substack']),
  exerciseIds: z.array(z.string()).optional(),
  title: z.string().optional(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  abstract: z.string().optional(),
  keyTakeaways: z.array(z.string()).optional(),
  publishedYear: z.number().int().min(1900).max(2100).optional(),
});

const router = Router();

router.use(requireAuth);

router.post(
  '/ingest',
  validateRequest({ body: ingestStudySchema }),
  researchController.ingestStudy
);

router.get('/cards', researchController.getCards);

export const researchRouter = router;
