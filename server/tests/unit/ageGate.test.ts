import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateAge, ageGateMiddleware } from '../../src/middlewares/ageGate.js';
import { UnderageError } from '../../src/utils/errors.js';

describe('Gate T02: 18+ Age Invariant Safety Gate', () => {
  it('should accurately calculate user age relative to current date', () => {
    const today = new Date();

    // Exactly 18 years ago today
    const exactly18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    assert.equal(calculateAge(exactly18), 18);

    // 17 years and 364 days ago (birthday is tomorrow)
    const turns18Tomorrow = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
    assert.equal(calculateAge(turns18Tomorrow), 17);

    // 25 years ago
    const age25 = new Date(today.getFullYear() - 25, 0, 15);
    assert.ok(calculateAge(age25) >= 24);

    // 14 years ago
    const age14 = new Date(today.getFullYear() - 14, 5, 10);
    assert.ok(calculateAge(age14) <= 14);
  });

  it('should terminate request with UnderageError when is18Plus is false', () => {
    let capturedError: any = null;
    const req: any = { body: { is18Plus: false } };
    const res: any = {};
    const next = (err?: any) => {
      capturedError = err;
    };

    ageGateMiddleware(req, res, next);

    assert.ok(capturedError instanceof UnderageError, 'Must throw UnderageError');
    assert.equal(capturedError.status, 403);
    assert.equal(capturedError.code, 'forbidden_underage');
  });

  it('should terminate request with UnderageError when birthDate shows age < 18', () => {
    let capturedError: any = null;
    const today = new Date();
    const underAgeBirth = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate()).toISOString();

    const req: any = { body: { is18Plus: true, birthDate: underAgeBirth } };
    const res: any = {};
    const next = (err?: any) => {
      capturedError = err;
    };

    ageGateMiddleware(req, res, next);

    assert.ok(capturedError instanceof UnderageError, 'Must throw UnderageError for birthdate < 18');
    assert.equal(capturedError.status, 403);
    assert.equal(capturedError.code, 'forbidden_underage');
  });

  it('should permit request when user is 18 years or older', () => {
    let calledNext = false;
    let capturedError: any = null;
    const today = new Date();
    const adultBirth = new Date(today.getFullYear() - 20, 0, 1).toISOString();

    const req: any = { body: { is18Plus: true, birthDate: adultBirth } };
    const res: any = {};
    const next = (err?: any) => {
      calledNext = true;
      capturedError = err;
    };

    ageGateMiddleware(req, res, next);

    assert.equal(calledNext, true, 'Next must be invoked without error');
    assert.equal(capturedError, undefined);
  });

  it('should terminate request when authenticated user flag is18Plus is false', () => {
    let capturedError: any = null;
    const req: any = { user: { userId: 'u1', is18Plus: false } };
    const res: any = {};
    const next = (err?: any) => {
      capturedError = err;
    };

    ageGateMiddleware(req, res, next);

    assert.ok(capturedError instanceof UnderageError);
    assert.equal(capturedError.status, 403);
    assert.equal(capturedError.code, 'forbidden_underage');
  });
});
