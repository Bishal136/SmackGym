import { InstitutionModel, type IInstitution } from '../models/institution.model.js';
import { InstitutionalSeatModel, type IInstitutionalSeat } from '../models/institutionalSeat.model.js';
import { UserModel } from '../models/user.model.js';
import { signAccessToken, generateRefreshToken, hashToken } from '../utils/jwt.js';
import { getRedisClient } from '../config/redis.js';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface CreateInstitutionInput {
  name: string;
  domainPattern?: string; // e.g. "@.*\\.ac\\.uk$"
  totalSeats?: number;
  samlEntityId?: string;
}

export interface SamlSsoInput {
  email: string;
  fullName?: string;
  institutionDomain?: string;
  samlAssertionToken?: string;
}

export class InstitutionService {
  /**
   * Creates an institutional university account (Gate T14)
   */
  public async createInstitution(input: CreateInstitutionInput): Promise<IInstitution> {
    const domainPattern = input.domainPattern || '@.*\\.ac\\.uk$';
    const totalSeats = input.totalSeats ?? 500;

    const institution = await InstitutionModel.create({
      name: input.name,
      domainPattern,
      totalSeats,
      usedSeats: 0,
      status: 'active',
      subscriptionTier: 'enterprise_university',
      samlEntityId: input.samlEntityId,
    });

    logger.info(`University institution created: '${institution.name}' with ${totalSeats} initial seats [${domainPattern}]`);
    return institution;
  }

  /**
   * Retrieves institution details by ID
   */
  public async getInstitution(id: string): Promise<IInstitution> {
    const institution = await InstitutionModel.findById(id);
    if (!institution) {
      throw new NotFoundError(`Institution with ID '${id}' not found`);
    }
    return institution;
  }

  /**
   * Lists all institutions
   */
  public async listInstitutions(): Promise<any[]> {
    return await InstitutionModel.find().sort({ createdAt: -1 }).lean();
  }

  /**
   * Bulk provisions seats for an enterprise university partner (Gate T14)
   * e.g. Single purchase adding 500 seats for @*.ac.uk domain
   */
  public async provisionBulkSeats(institutionId: string, seatsToAdd: number): Promise<IInstitution> {
    if (seatsToAdd <= 0) {
      throw new BadRequestError('seatsToAdd must be greater than zero');
    }

    const institution = await InstitutionModel.findOneAndUpdate(
      { _id: institutionId, status: 'active' },
      { $inc: { totalSeats: seatsToAdd } },
      { new: true }
    );

    if (!institution) {
      throw new NotFoundError(`Active institution with ID '${institutionId}' not found`);
    }

    logger.info(`Enterprise bulk seat provision: added ${seatsToAdd} seats to institution ${institutionId}. Total: ${institution.totalSeats}`);
    return institution;
  }

  /**
   * Claims an institutional university seat for a student-athlete (Gate T14)
   */
  public async claimSeat(userId: string, userEmail: string): Promise<{
    institution: IInstitution;
    seat: IInstitutionalSeat;
  }> {
    // 1. Find an active institution matching this user's email domain
    const institutions = await InstitutionModel.find({ status: 'active' });
    const matchingInstitution = institutions.find((inst) => {
      try {
        const regex = new RegExp(inst.domainPattern, 'i');
        return regex.test(userEmail);
      } catch {
        return false;
      }
    });

    if (!matchingInstitution) {
      throw new ForbiddenError(
        `Email '${userEmail}' does not match any accredited UK university domain (@*.ac.uk)`,
        'institutional_domain_mismatch'
      );
    }

    // 2. Check if seat already claimed by this user
    const existingSeat = await InstitutionalSeatModel.findOne({
      institutionId: matchingInstitution._id,
      userId,
      status: 'active',
    });
    if (existingSeat) {
      return { institution: matchingInstitution, seat: existingSeat };
    }

    // 3. Atomically claim seat if capacity exists
    const updatedInstitution = await InstitutionModel.findOneAndUpdate(
      {
        _id: matchingInstitution._id,
        status: 'active',
        $expr: { $lt: ['$usedSeats', '$totalSeats'] },
      },
      { $inc: { usedSeats: 1 } },
      { new: true }
    );

    if (!updatedInstitution) {
      throw new ConflictError(
        `All allocated seats (${matchingInstitution.totalSeats}) for ${matchingInstitution.name} have been exhausted`,
        'institutional_seats_exhausted'
      );
    }

    // 4. Record seat assignment
    const seat = await InstitutionalSeatModel.create({
      institutionId: updatedInstitution._id,
      userId,
      userEmail,
      status: 'active',
      assignedAt: new Date(),
    });

    // 5. Update user mode
    await UserModel.findByIdAndUpdate(userId, { mode: 'professional' });

    logger.info(`Student-athlete seat claimed: User ${userId} (${userEmail}) at ${updatedInstitution.name}`);
    return { institution: updatedInstitution, seat };
  }

  /**
   * Handles Enterprise SAML 2.0 / OIDC SSO assertion login (Milestone M5)
   */
  public async handleSamlSso(input: SamlSsoInput): Promise<{
    user: any;
    tokens: { accessToken: string; refreshToken: string; expiresIn: number };
    institution: IInstitution;
  }> {
    const email = input.email.toLowerCase().trim();

    // 1. Validate university domain
    const institutions = await InstitutionModel.find({ status: 'active' });
    const matchingInstitution = institutions.find((inst) => {
      try {
        return new RegExp(inst.domainPattern, 'i').test(email);
      } catch {
        return false;
      }
    });

    if (!matchingInstitution) {
      throw new ForbiddenError(
        `SAML assertion failed: Domain '${email}' is not affiliated with an accredited institution`,
        'sso_domain_unauthorized'
      );
    }

    // 2. Find or provision user
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({
        email,
        passwordHash: 'sso_federated_auth_provider',
        fullName: input.fullName || 'University Student Athlete',
        role: 'ATHLETE',
        is18Plus: true,
        mode: 'professional',
      });
    }

    // 3. Auto-claim institutional seat
    await this.claimSeat(user._id.toString(), email);

    // 4. Issue RS256 token pair
    const access = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      is18Plus: user.is18Plus,
    });

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = hashToken(rawRefreshToken);

    const redis = getRedisClient();
    const sessionKey = `rt:${user._id.toString()}:${tokenHash}`;
    await redis.set(sessionKey, JSON.stringify({ userId: user._id.toString(), email: user.email }), 'EX', 7 * 86400);

    return {
      user: user.toProfile(),
      tokens: {
        accessToken: access.token,
        refreshToken: rawRefreshToken,
        expiresIn: access.expiresIn,
      },
      institution: matchingInstitution,
    };
  }
}

export const institutionService = new InstitutionService();
