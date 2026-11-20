import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
} from '../../src/utils/jwt.js';

describe('RS256 JWT & Token Utility', () => {
  it('should sign and verify an asymmetric RS256 access token', () => {
    const payload = {
      userId: 'test-user-uuid-1234',
      email: 'athlete@smackgym.co.uk',
      role: 'ATHLETE' as const,
      is18Plus: true,
    };

    const { token, jti, expiresIn } = signAccessToken(payload);

    assert.ok(typeof token === 'string' && token.length > 50, 'Token must be a non-empty string');
    assert.ok(typeof jti === 'string' && jti.length > 0, 'JTI must be generated');
    assert.equal(expiresIn, 900, 'Expiration should be 900 seconds (15 mins)');

    const decoded = verifyAccessToken(token);

    assert.equal(decoded.sub, payload.userId);
    assert.equal(decoded.email, payload.email);
    assert.equal(decoded.role, payload.role);
    assert.equal(decoded.is18Plus, true);
    assert.equal(decoded.jti, jti);
    assert.ok(decoded.exp > decoded.iat, 'Expiration timestamp must exceed issued timestamp');
  });

  it('should reject a tampered token', () => {
    const payload = {
      userId: 'test-user-tampered',
      email: 'attacker@example.com',
      role: 'ATHLETE' as const,
      is18Plus: true,
    };

    const { token } = signAccessToken(payload);
    const tampered = token.slice(0, -6) + 'xxxxxx';

    assert.throws(
      () => verifyAccessToken(tampered),
      /invalid_token|Invalid access token signature/
    );
  });

  it('should generate a 40-byte hex random refresh token', () => {
    const refresh1 = generateRefreshToken();
    const refresh2 = generateRefreshToken();

    assert.equal(refresh1.length, 80, '40 bytes in hex is 80 characters');
    assert.notEqual(refresh1, refresh2, 'Generated tokens must be distinct');
  });

  it('should compute consistent SHA-256 token hash', () => {
    const token = 'sample-refresh-token-string';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    assert.equal(hash1, hash2, 'Hash must be deterministic');
    assert.equal(hash1.length, 64, 'SHA-256 produces 64 hex characters');
  });
});
