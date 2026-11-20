import argon2 from 'argon2';

/**
 * Hash password with Argon2id using secure parameters
 * Memory cost: 19456 KiB (~19 MiB)
 * Time cost: 2 iterations
 * Parallelism: 1 thread
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verify password against Argon2id hash
 */
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
