import { z } from 'zod';
import dotenv from 'dotenv';
import crypto from 'node:crypto';

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .default('4000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive().max(65535)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().default('mongodb://localhost:27017/smackgym?replicaSet=rs0'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_PRIVATE_KEY: z.string().optional(),
  JWT_ACCESS_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY_DAYS: z
    .string()
    .default('30')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:5173'),
  BUNNY_STREAM_API_KEY: z.string().default('dev_bunny_secret_token_key_12345'),
  BUNNY_LIBRARY_ID: z.string().default('smackgym-dev-library'),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_smackgym_test_secret_12345'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

const rawConfig = parsedEnv.data;

// Generate ephemeral RSA keypair for dev/test environments if keys are omitted
let privateKey = rawConfig.JWT_ACCESS_PRIVATE_KEY;
let publicKey = rawConfig.JWT_ACCESS_PUBLIC_KEY;

if (!privateKey || !publicKey) {
  if (rawConfig.NODE_ENV === 'production') {
    throw new Error('JWT_ACCESS_PRIVATE_KEY and JWT_ACCESS_PUBLIC_KEY must be configured in production');
  }
  const generated = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });
  privateKey = generated.privateKey;
  publicKey = generated.publicKey;
}

export const env = {
  ...rawConfig,
  JWT_ACCESS_PRIVATE_KEY: privateKey,
  JWT_ACCESS_PUBLIC_KEY: publicKey,
  CORS_ORIGINS: rawConfig.CORS_ORIGIN.split(',').map((o) => o.trim()),
};

export type Env = typeof env;
