/**
 * User & Authorization Domain Types
 * Enforces SMACKGYM 3-Role System: ATHLETE, COACH, SUPER_ADMIN
 */

export type UserRole = 'ATHLETE' | 'COACH' | 'SUPER_ADMIN';

export type UserMode = 'personal' | 'professional';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  is18Plus: boolean;
  birthDate?: string;
  avatarUrl?: string;
  mode: UserMode;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  is18PlusVerified: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
