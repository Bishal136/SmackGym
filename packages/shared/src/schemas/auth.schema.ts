import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  is18Plus: z.literal(true, {
    errorMap: () => ({ message: 'You must be 18 years of age or older to use SMACKGYM' }),
  }),
  birthDate: z.string().datetime().optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service & Privacy Policy' }),
  }),
  role: z.enum(['ATHLETE', 'COACH', 'SUPER_ADMIN']).optional(),
  mode: z.enum(['personal', 'professional']).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
