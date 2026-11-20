import type { Request, Response, NextFunction } from 'express';
import { UnderageError } from '../utils/errors.js';

/**
 * Calculates age based on a birthdate
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Validates that an applicant or authenticated user is at least 18 years old.
 * Intercepts underage requests and terminates with HTTP 403 (code: "forbidden_underage").
 */
export function ageGateMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // 1. Authenticated user check
  if ((req as any).user && (req as any).user.is18Plus === false) {
    return next(new UnderageError());
  }

  // 2. Unauthenticated registration payload check
  if (req.body && typeof req.body === 'object') {
    if (req.body.is18Plus === false) {
      return next(new UnderageError());
    }

    if (req.body.birthDate) {
      const birth = new Date(req.body.birthDate);
      if (!isNaN(birth.getTime())) {
        const age = calculateAge(birth);
        if (age < 18) {
          return next(new UnderageError('User age is under 18 according to birth date'));
        }
      }
    }
  }

  next();
}
