import type { ProblemDetails } from '@smackgym/shared';

export interface InvalidParam {
  name: string;
  reason: string;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly title: string;
  public readonly type: string;
  public readonly invalidParams?: InvalidParam[];

  constructor(
    message: string,
    status = 500,
    code = 'internal_server_error',
    title = 'Internal Server Error',
    invalidParams?: InvalidParam[]
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.title = title;
    this.type = `https://api.smackgym.com/errors/${code}`;
    this.invalidParams = invalidParams;
    Error.captureStackTrace(this, this.constructor);
  }

  public toProblemDetails(instance?: string): ProblemDetails {
    return {
      type: this.type,
      title: this.title,
      status: this.status,
      detail: this.message,
      instance,
      code: this.code,
      timestamp: new Date().toISOString(),
      ...(this.invalidParams ? { invalidParams: this.invalidParams } : {}),
    };
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'bad_request') {
    super(message, 400, code, 'Bad Request');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', code = 'not_found') {
    super(message, 404, code, 'Not Found');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'unauthorized') {
    super(message, 401, code, 'Unauthorized');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', code = 'forbidden') {
    super(message, 403, code, 'Forbidden');
  }
}

export class UnderageError extends AppError {
  constructor(message = 'You must be 18 years of age or older to use SMACKGYM') {
    super(message, 403, 'forbidden_underage', 'Forbidden: Underage User');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', code = 'conflict') {
    super(message, 409, code, 'Conflict');
  }
}

export class ConcurrencyError extends AppError {
  constructor(message = 'Document modified by concurrent transaction', code = 'stale_revision') {
    super(message, 409, code, 'Stale Revision Conflict');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', invalidParams?: InvalidParam[]) {
    super(message, 422, 'validation_failed', 'Unprocessable Entity', invalidParams);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests, please try again later', code = 'rate_limit_exceeded') {
    super(message, 429, code, 'Too Many Requests');
  }
}
