import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../../src/utils/argon.js';

describe('Argon2id Password Security Utility', () => {
  it('should hash a plain password into a valid Argon2id format', async () => {
    const plain = 'StrongPass123!';
    const hash = await hashPassword(plain);

    assert.ok(hash.startsWith('$argon2id$'), 'Hash must start with $argon2id$ identifier');
    assert.notEqual(hash, plain);
  });

  it('should verify correct password successfully', async () => {
    const plain = 'CorrectPassword_2026';
    const hash = await hashPassword(plain);
    const isValid = await verifyPassword(hash, plain);

    assert.equal(isValid, true, 'Verification must return true for correct password');
  });

  it('should reject incorrect password', async () => {
    const plain = 'CorrectPassword_2026';
    const hash = await hashPassword(plain);
    const isValid = await verifyPassword(hash, 'WrongPassword_9999');

    assert.equal(isValid, false, 'Verification must return false for incorrect password');
  });

  it('should produce distinct salts for identical passwords', async () => {
    const plain = 'SamePasswordEveryTime';
    const hash1 = await hashPassword(plain);
    const hash2 = await hashPassword(plain);

    assert.notEqual(hash1, hash2, 'Hashes must differ due to unique cryptographic salts');
  });
});
