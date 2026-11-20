import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  UnderageError,
  ConflictError,
  ConcurrencyError,
  ValidationError,
  TooManyRequestsError,
} from '../../src/utils/errors.js';

describe('RFC 7807 Problem Details Error Hierarchy', () => {
  it('should format NotFoundError to RFC 7807 payload', () => {
    const err = new NotFoundError('User athlete-999 not found');
    const problem = err.toProblemDetails('/v1/athletes/athlete-999');

    assert.equal(problem.status, 404);
    assert.equal(problem.code, 'not_found');
    assert.equal(problem.title, 'Not Found');
    assert.equal(problem.detail, 'User athlete-999 not found');
    assert.equal(problem.type, 'https://api.smackgym.com/errors/not_found');
    assert.equal(problem.instance, '/v1/athletes/athlete-999');
    assert.ok(problem.timestamp);
  });

  it('should format UnderageError with forbidden_underage code', () => {
    const err = new UnderageError();
    const problem = err.toProblemDetails('/v1/auth/register');

    assert.equal(problem.status, 403);
    assert.equal(problem.code, 'forbidden_underage');
    assert.equal(problem.type, 'https://api.smackgym.com/errors/forbidden_underage');
  });

  it('should format ConcurrencyError with stale_revision code', () => {
    const err = new ConcurrencyError();
    const problem = err.toProblemDetails('/v1/plans/plan-1/adapt');

    assert.equal(problem.status, 409);
    assert.equal(problem.code, 'stale_revision');
    assert.equal(problem.type, 'https://api.smackgym.com/errors/stale_revision');
  });

  it('should format ValidationError with invalidParams list', () => {
    const invalidParams = [
      { name: 'body.email', reason: 'Invalid email address' },
      { name: 'body.is18Plus', reason: 'You must be 18 years of age or older' },
    ];
    const err = new ValidationError('Payload invalid', invalidParams);
    const problem = err.toProblemDetails('/v1/auth/register');

    assert.equal(problem.status, 422);
    assert.equal(problem.code, 'validation_failed');
    assert.deepEqual(problem.invalidParams, invalidParams);
  });
});
