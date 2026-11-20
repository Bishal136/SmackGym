import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema, ZodError } from 'zod';
import { ValidationError, type InvalidParam } from '../utils/errors.js';

interface RequestValidators {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validateRequest(validators: RequestValidators) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const invalidParams: InvalidParam[] = [];

    if (validators.body) {
      const result = await validators.body.safeParseAsync(req.body);
      if (!result.success) {
        collectZodErrors(result.error, 'body', invalidParams);
      } else {
        req.body = result.data;
      }
    }

    if (validators.query) {
      const result = await validators.query.safeParseAsync(req.query);
      if (!result.success) {
        collectZodErrors(result.error, 'query', invalidParams);
      } else {
        req.query = result.data;
      }
    }

    if (validators.params) {
      const result = await validators.params.safeParseAsync(req.params);
      if (!result.success) {
        collectZodErrors(result.error, 'params', invalidParams);
      } else {
        req.params = result.data;
      }
    }

    if (invalidParams.length > 0) {
      return next(new ValidationError('Request validation failed', invalidParams));
    }

    next();
  };
}

function collectZodErrors(error: ZodError, location: string, list: InvalidParam[]): void {
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? `${location}.${issue.path.join('.')}` : location;
    list.push({
      name: path,
      reason: issue.message,
    });
  }
}
