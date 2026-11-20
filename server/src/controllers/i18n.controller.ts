import type { Request, Response, NextFunction } from 'express';
import { i18nService } from '../services/i18n.service.js';

export class I18nController {
  public getTranslations(req: Request, res: Response, next: NextFunction): void {
    try {
      const rawLang = (req.query.lang as string) || req.header('Accept-Language');
      const locale = i18nService.resolveLocale(rawLang);
      const translations = i18nService.getTranslationBundle(locale);
      res.status(200).json({ success: true, locale, translations });
    } catch (err) {
      next(err);
    }
  }

  public translate(req: Request, res: Response, next: NextFunction): void {
    try {
      const { key } = req.body;
      const rawLang = (req.query.lang as string) || (req.body.lang as string) || req.header('Accept-Language');
      const locale = i18nService.resolveLocale(rawLang);
      const message = i18nService.translate(key, locale);
      res.status(200).json({ success: true, key, locale, lang: locale, translation: message });
    } catch (err) {
      next(err);
    }
  }
}

export const i18nController = new I18nController();
