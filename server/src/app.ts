import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { correlationIdMiddleware } from './middlewares/correlationId.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { metricsMiddleware, metricsRegistry } from './middlewares/metrics.js';
import { apiV1Router } from './routes/index.js';
import { NotFoundError } from './utils/errors.js';
import { logger } from './utils/logger.js';
import { getRedisClient } from './config/redis.js';

export function createApp(): express.Application {
  const app = express();

  // 1. Defensive HTTP Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
    })
  );

  // 2. CORS with Explicit Origins
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl) or if origin is in whitelist
        if (!origin || env.CORS_ORIGINS.includes(origin) || env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'Idempotency-Key'],
    })
  );

  // 3. Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Request Correlation ID
  app.use(correlationIdMiddleware);

  // 5. Telemetry & Metrics Collection
  app.use(metricsMiddleware);

  // 6. HTTP Access Logging
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const correlationId = req.correlationId;
      logger.info(`${req.method} ${req.originalUrl} [${res.statusCode}] - ${duration}ms`, {
        correlationId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      });
    });
    next();
  });

  // 6. System Health Check Endpoints
  const healthHandler = async (_req: Request, res: Response) => {
    const mongoReady = mongoose.connection.readyState === 1;
    let redisReady = false;
    try {
      const redis = getRedisClient();
      redisReady = redis.status === 'ready' || redis.status === 'connect';
    } catch {
      redisReady = false;
    }

    const healthy = mongoReady && redisReady;
    const status = healthy ? 200 : 503;

    res.status(status).json({
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        mongodb: mongoReady ? 'connected' : 'disconnected',
        redis: redisReady ? 'connected' : 'disconnected',
      },
    });
  };

  app.get('/health', healthHandler);
  app.get('/v1/health', healthHandler);

  // 7. Prometheus Metrics Exposition (RULE-OBS-01)
  const metricsHandler = (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(200).send(metricsRegistry.getPrometheusText());
  };
  app.get('/metrics', metricsHandler);
  app.get('/v1/metrics', metricsHandler);

  // 8. Mount Versioned API Routes
  app.use('/v1', apiV1Router);

  // 8. 404 Catch-All Route (RFC 7807)
  app.use((req: Request, _res: Response, next) => {
    next(new NotFoundError(`The requested endpoint '${req.method} ${req.path}' does not exist`));
  });

  // 9. Centralized RFC 7807 Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
