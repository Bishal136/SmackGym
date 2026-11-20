import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 5) return null; // stop retrying after 5 attempts if server is down
        const delay = Math.min(times * 100, 1000);
        return delay;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    redisClient.on('close', () => {
      logger.warn('Redis client connection closed');
    });
  }

  return redisClient;
}

export async function connectRedis(): Promise<Redis> {
  const client = getRedisClient();
  if (client.status === 'ready') {
    return client;
  }
  return new Promise((resolve, reject) => {
    client.once('ready', () => resolve(client));
    client.once('error', (err) => reject(err));
  });
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    const client = redisClient;
    redisClient = null;
    try {
      if (client.status === 'ready') {
        await client.quit();
      } else {
        client.disconnect();
      }
    } catch {
      client.disconnect();
    }
    logger.info('Redis disconnected cleanly');
  }
}
