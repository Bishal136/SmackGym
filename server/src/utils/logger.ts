import winston from 'winston';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'refreshtoken',
  'refresh_token',
  'creditcard',
  'credit_card',
  'cvv',
  'nhsnumber',
  'nhs_number',
  'secret',
  'medicalhold',
  'medical_hold',
  'aichats',
  'ai_chats',
]);

function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, '');
    if (SENSITIVE_KEYS.has(normalizedKey) || SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object') {
      sanitized[key] = redactSensitiveData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

const redactFormat = winston.format((info) => {
  const sanitized = redactSensitiveData(info);
  Object.assign(info, sanitized);
  return info;
});

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    redactFormat(),
    winston.format.errors({ stack: true }),
    isProduction ? winston.format.json() : winston.format.colorize(),
    isProduction
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, correlationId, stack, ...meta }) => {
          const cid = correlationId ? ` [${correlationId}]` : '';
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          const errStack = stack ? `\n${stack}` : '';
          return `${timestamp} [${level}]${cid}: ${message}${metaStr}${errStack}`;
        })
  ),
  transports: [
    new winston.transports.Console(),
    ...(isProduction
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});
