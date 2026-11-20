import { SubscriptionModel, type SubscriptionTier } from '../models/subscription.model.js';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export interface StripeWebhookEvent {
  id: string; // evt_...
  type: string;
  data: {
    object: {
      id?: string; // sub_...
      customer?: string; // cus_...
      status?: string;
      current_period_end?: number;
      metadata?: {
        userId?: string;
        tier?: SubscriptionTier;
      };
    };
  };
}

export class BillingService {
  /**
   * Idempotent Stripe webhook event processor (PRD-BILL-02, RULE-SEC-04)
   */
  public async processWebhookEvent(event: StripeWebhookEvent): Promise<{ received: boolean; deduplicated?: boolean }> {
    const redis = getRedisClient();
    const eventKey = `stripe:event:${event.id}`;

    // 1. Idempotency Check: 24-hour TTL in Redis
    const alreadyProcessed = await redis.set(eventKey, 'processed', 'EX', 86400, 'NX');
    if (!alreadyProcessed) {
      logger.info(`Stripe webhook event '${event.id}' deduplicated`, { eventId: event.id });
      return { received: true, deduplicated: true };
    }

    const obj = event.data.object;
    const userId = obj.metadata?.userId || 'unknown-user';
    const tier = (obj.metadata?.tier as SubscriptionTier) || 'monthly';
    const subId = obj.id || `sub_${event.id}`;
    const customerId = obj.customer || 'cus_unknown';
    const currentPeriodEnd = obj.current_period_end
      ? new Date(obj.current_period_end * 1000)
      : new Date(Date.now() + 30 * 86400 * 1000);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'invoice.payment_succeeded':
        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          {
            $set: {
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subId,
              tier,
              status: 'active',
              currentPeriodEnd,
            },
          },
          { upsert: true, new: true }
        );
        logger.info(`Subscription ${subId} activated for user ${userId}`, { tier });
        break;

      case 'customer.subscription.deleted':
        await SubscriptionModel.findOneAndUpdate(
          { stripeSubscriptionId: subId },
          { $set: { status: 'canceled' } }
        );
        logger.info(`Subscription ${subId} canceled`);
        break;

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true, deduplicated: false };
  }

  /**
   * Retrieve active subscription tier for user
   */
  public async getSubscription(userId: string): Promise<any> {
    return await SubscriptionModel.findOne({ userId, status: 'active' }).lean();
  }
}

export const billingService = new BillingService();
