import { UserModel } from '../models/user.model.js';
import { ConsentRecordModel } from '../models/consentRecord.model.js';
import { hashPassword, verifyPassword } from '../utils/argon.js';
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from '../utils/jwt.js';
import { getRedisClient } from '../config/redis.js';
import { env } from '../config/env.js';
import {
  ConflictError,
  UnauthorizedError,
  UnderageError,
  NotFoundError,
  ForbiddenError,
} from '../utils/errors.js';
import { calculateAge } from '../middlewares/ageGate.js';
import type {
  RegisterInput,
  LoginInput,
  UserProfile,
  TokenPair,
} from '@smackgym/shared';
import jwt from 'jsonwebtoken';

export interface RequestMetadata {
  ipAddress: string;
  userAgent: string;
}

export class AuthService {
  /**
   * Register a new athlete account enforcing 18+ gate and UK GDPR consent recording
   */
  public async register(
    input: RegisterInput,
    meta: RequestMetadata
  ): Promise<{ user: UserProfile; tokens: TokenPair }> {
    // 0. Safety Kill Switch: New Registrations Paused (PRD-ADM-01, Gate T08)
    try {
      const redis = getRedisClient();
      const isRegPaused =
        (await redis.get('killswitch:NEW_REGISTRATIONS_PAUSED')) ||
        (await redis.get('killswitch:NEW_REGISTRATIONS_PAUSE'));
      if (isRegPaused === '1' || isRegPaused === 'true') {
        throw new ForbiddenError(
          'New user registrations are temporarily paused by administrative safety hold',
          'registrations_paused'
        );
      }
    } catch (err) {
      if (err instanceof ForbiddenError) throw err;
    }

    // 1. Mandatory 18+ Age Invariant Check (PRD-AUTH-01, RULE-SAFE-03, Gate T02)
    if (!input.is18Plus) {
      throw new UnderageError();
    }

    if (input.birthDate) {
      const birth = new Date(input.birthDate);
      if (!isNaN(birth.getTime()) && calculateAge(birth) < 18) {
        throw new UnderageError('User age is under 18 according to birth date');
      }
    }

    // 2. Check for existing account with same email
    const existingUser = await UserModel.findOne({ email: input.email }).lean();
    if (existingUser) {
      throw new ConflictError('An account with this email already exists', 'email_already_registered');
    }

    // 3. Argon2id Password Hashing
    const passwordHash = await hashPassword(input.password);

    // 4. Create User Document (Revision initialized to 1)
    const userRole = input.role || 'ATHLETE';
    const userMode = input.mode || (userRole === 'COACH' ? 'professional' : 'personal');

    const user = new UserModel({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: userRole,
      is18Plus: true,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      mode: userMode,
      revision: 1,
    });

    await user.save();

    // 5. Store UK GDPR Consent Audit Trail (PRD-AUTH-03)
    await ConsentRecordModel.create([
      {
        userId: user._id,
        consentType: 'TOS_AND_PRIVACY',
        consentGiven: true,
        policyVersion: '1.0',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        timestamp: new Date(),
      },
      {
        userId: user._id,
        consentType: 'ARTICLE_9_HEALTH',
        consentGiven: true,
        policyVersion: '1.0',
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        timestamp: new Date(),
      },
    ]);

    // 6. Issue Asymmetric RS256 JWT Access Token and Refresh Token
    const tokens = await this.issueTokenPair(user._id, user.email, user.role, user.is18Plus);

    return {
      user: user.toProfile(),
      tokens,
    };
  }

  /**
   * Authenticate athlete or coach via Argon2id password verification
   */
  public async login(
    input: LoginInput,
    _meta: RequestMetadata
  ): Promise<{ user: UserProfile; tokens: TokenPair }> {
    const user = await UserModel.findOne({ email: input.email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', 'invalid_credentials');
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password', 'invalid_credentials');
    }

    if (!user.is18Plus) {
      throw new UnderageError();
    }

    const tokens = await this.issueTokenPair(user._id, user.email, user.role, user.is18Plus);

    return {
      user: user.toProfile(),
      tokens,
    };
  }

  /**
   * Rotate and refresh access token via Redis-persisted sliding refresh token
   */
  public async refreshToken(rawRefreshToken: string): Promise<TokenPair> {
    const tokenHash = hashToken(rawRefreshToken);
    const redis = getRedisClient();

    const storedData = await redis.get(`auth:refresh:${tokenHash}`);
    if (!storedData) {
      throw new UnauthorizedError('Refresh token is invalid or expired', 'invalid_refresh_token');
    }

    const { userId } = JSON.parse(storedData) as { userId: string };

    const user = await UserModel.findById(userId);
    if (!user) {
      await redis.del(`auth:refresh:${tokenHash}`);
      throw new UnauthorizedError('User account not found', 'user_not_found');
    }

    // Invalidate consumed refresh token (token rotation)
    await redis.del(`auth:refresh:${tokenHash}`);

    // Issue new pair
    return await this.issueTokenPair(user._id, user.email, user.role, user.is18Plus);
  }

  /**
   * Log out user: blacklists access token and invalidates active refresh token in Redis
   */
  public async logout(userId: string, accessToken?: string, rawRefreshToken?: string): Promise<void> {
    const redis = getRedisClient();

    // 1. Blacklist access token until its natural expiration
    if (accessToken) {
      try {
        const decoded = jwt.decode(accessToken) as { jti?: string; exp?: number } | null;
        if (decoded && decoded.jti && decoded.exp) {
          const remainingSec = decoded.exp - Math.floor(Date.now() / 1000);
          if (remainingSec > 0) {
            await redis.set(`bl:token:${decoded.jti}`, 'revoked', 'EX', remainingSec);
          }
        }
      } catch {
        // Ignore token decode errors on logout
      }
    }

    // 2. Invalidate refresh token if supplied
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await redis.del(`auth:refresh:${tokenHash}`);
    }

    // Invalidate all tracked sessions for user if required
    await redis.srem(`auth:user_tokens:${userId}`, rawRefreshToken ? hashToken(rawRefreshToken) : '');
  }

  /**
   * Retrieve current user profile
   */
  public async getMe(userId: string): Promise<UserProfile> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found', 'user_not_found');
    }
    return user.toProfile();
  }

  /**
   * Helper to issue an RS256 Access Token and a 30-day sliding Refresh Token stored in Redis
   */
  private async issueTokenPair(
    userId: string,
    email: string,
    role: any,
    is18Plus: boolean
  ): Promise<TokenPair> {
    const { token: accessToken, expiresIn } = signAccessToken({
      userId,
      email,
      role,
      is18Plus,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashToken(refreshToken);
    const ttlSeconds = env.JWT_REFRESH_EXPIRY_DAYS * 24 * 60 * 60;

    const redis = getRedisClient();
    await redis.set(
      `auth:refresh:${tokenHash}`,
      JSON.stringify({ userId, createdAt: Date.now() }),
      'EX',
      ttlSeconds
    );

    // Track user's active refresh tokens
    await redis.sadd(`auth:user_tokens:${userId}`, tokenHash);
    await redis.expire(`auth:user_tokens:${userId}`, ttlSeconds);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}

export const authService = new AuthService();
