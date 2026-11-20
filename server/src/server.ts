import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { logger } from './utils/logger.js';

let server: http.Server | null = null;
let isShuttingDown = false;

async function startServer(): Promise<void> {
  try {
    logger.info('Initializing SMACKGYM Backend Services (Phase P0 Baseline)...');

    // Connect to MongoDB 8.0 Replica Set
    await connectDatabase();

    // Connect to Redis 7.4
    await connectRedis();

    // Seed default admin in development if missing
    if (env.NODE_ENV !== 'production') {
      const { UserModel } = await import('./models/user.model.js');
      const { hashPassword } = await import('./utils/argon.js');
      const existingAdmin = await UserModel.findOne({ email: 'admin@smackgym.co.uk' });
      if (!existingAdmin) {
        const hash = await hashPassword('AdminSecret2026!');
        await UserModel.create({
          email: 'admin@smackgym.co.uk',
          passwordHash: hash,
          fullName: 'System Super Admin',
          role: 'SUPER_ADMIN',
          mode: 'personal',
          is18Plus: true,
        });
        logger.info('Dev super admin account seeded: admin@smackgym.co.uk');
      }
    }

    // Start HTTP Server
    server = http.createServer(app);
    server.listen(env.PORT, () => {
      logger.info(`SMACKGYM Backend Server running on port ${env.PORT} [${env.NODE_ENV}]`);
      logger.info(`Health check available at http://localhost:${env.PORT}/health`);
    });

    // Register process termination handlers
    process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Promise Rejection:', {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', {
        message: error.message,
        stack: error.stack,
      });
      handleGracefulShutdown('uncaughtException', 1);
    });
  } catch (error: any) {
    logger.error('Fatal error during server startup:', {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

async function handleGracefulShutdown(signal: string, exitCode = 0): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);

  const forceTimeout = setTimeout(() => {
    logger.error('Forced shutdown timeout reached. Terminating process.');
    process.exit(1);
  }, 10000);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      logger.info('HTTP server closed');
    }

    await disconnectDatabase();
    await disconnectRedis();

    clearTimeout(forceTimeout);
    logger.info('Graceful shutdown completed successfully');
    process.exit(exitCode);
  } catch (error: any) {
    logger.error('Error encountered during graceful shutdown:', { error: error.message });
    clearTimeout(forceTimeout);
    process.exit(1);
  }
}

startServer();
