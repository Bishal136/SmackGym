import type { Request, Response, NextFunction } from 'express';
import { AppError, type InvalidParam } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { i18nService } from '../services/i18n.service.js';
import type { ProblemDetails } from '@smackgym/shared';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = req.correlationId || (req.header('X-Correlation-ID') as string) || 'unknown';
  const instance = req.originalUrl || req.url;

  let problem: ProblemDetails;

  if (err instanceof AppError) {
    problem = err.toProblemDetails(instance);
  } else if (err.name === 'ZodError') {
    const invalidParams: InvalidParam[] = (err.issues || []).map((issue: any) => ({
      name: issue.path.join('.'),
      reason: issue.message,
    }));
    problem = {
      type: 'https://api.smackgym.com/errors/validation_failed',
      title: 'Unprocessable Entity',
      status: 422,
      detail: 'Request validation failed',
      code: 'validation_failed',
      timestamp: new Date().toISOString(),
      instance,
      invalidParams,
    };
  } else if (err.code === 11000) {
    // Mongo duplicate key error
    const field = Object.keys(err.keyValue || {})[0] || 'resource';
    problem = {
      type: 'https://api.smackgym.com/errors/conflict',
      title: 'Conflict',
      status: 409,
      detail: `A resource with that ${field} already exists`,
      code: 'conflict',
      timestamp: new Date().toISOString(),
      instance,
    };
  } else if (err.name === 'CastError') {
    problem = {
      type: 'https://api.smackgym.com/errors/bad_request',
      title: 'Bad Request',
      status: 400,
      detail: `Invalid ${err.path}: ${err.value}`,
      code: 'bad_request',
      timestamp: new Date().toISOString(),
      instance,
    };
  } else {
    // Unhandled internal error
    const message = process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Internal Server Error';

    problem = {
      type: 'https://api.smackgym.com/errors/internal_server_error',
      title: 'Internal Server Error',
      status: 500,
      detail: message,
      code: 'internal_server_error',
      timestamp: new Date().toISOString(),
      instance,
    };
  }

  // Localize error detail if client specifies preferred language (Milestone M5)
  const clientLang = req.header('Accept-Language') || (req.query.lang as string);
  if (clientLang && problem.code) {
    const locale = i18nService.resolveLocale(clientLang);
    if (locale !== 'en') {
      const localized = i18nService.translate(problem.code, locale);
      if (localized && localized !== problem.code) {
        problem.detail = localized;
      }
    }
  }

  // Log error with Winston structured logger
  if (problem.status >= 500) {
    logger.error(`[${problem.status}] ${problem.title}: ${problem.detail}`, {
      correlationId,
      path: instance,
      method: req.method,
      stack: err.stack,
      err,
    });
  } else {
    logger.warn(`[${problem.status}] ${problem.title}: ${problem.detail}`, {
      correlationId,
      path: instance,
      method: req.method,
      code: problem.code,
    });
  }

  res.status(problem.status).contentType('application/problem+json').json(problem);
}
