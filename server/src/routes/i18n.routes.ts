import { Router } from 'express';
import { i18nController } from '../controllers/i18n.controller.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { z } from 'zod';

const translateSchema = z.object({
  key: z.string().min(1, 'Translation key is required'),
  lang: z.enum(['en', 'bn', 'hi', 'ur']).optional(),
});

const router = Router();

router.get('/translations', i18nController.getTranslations);

router.post(
  '/translate',
  validateRequest({ body: translateSchema }),
  i18nController.translate
);

export const i18nRouter = router;
