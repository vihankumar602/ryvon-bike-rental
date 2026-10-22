const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
}
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
}
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required' })
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL must be a postgresql:// URL'),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(32, 'JWT_SECRET must be at least 32 characters (see .env.example)'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  CORS_ORIGINS: z.string().default(''),
  TRUST_PROXY: z.string().default(''),
  BUSINESS_TIMEZONE: z.string().default('Asia/Kolkata'),
  MAX_BOOKING_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(20),
  API_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(300),
  FRONTEND_DIR: z.string().default(path.join(__dirname, '..', '..')),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const lines = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
  console.error(`Invalid environment configuration:\n${lines.join('\n')}\nCopy .env.example to .env and fill it in.`);
  process.exit(1);
}

// Fail fast on an invalid timezone instead of at the first booking request.
try {
  new Intl.DateTimeFormat('en-CA', { timeZone: parsed.data.BUSINESS_TIMEZONE });
} catch {
  console.error(`Invalid BUSINESS_TIMEZONE: ${parsed.data.BUSINESS_TIMEZONE}`);
  process.exit(1);
}

const env = parsed.data;
module.exports = {
  env: env.NODE_ENV,
  isProd: env.NODE_ENV === 'production',
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  bcryptRounds: env.BCRYPT_ROUNDS,
  corsOrigins: env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
  trustProxy: env.TRUST_PROXY,
  timezone: env.BUSINESS_TIMEZONE,
  maxBookingDays: env.MAX_BOOKING_DAYS,
  authRateLimitMax: env.AUTH_RATE_LIMIT_MAX,
  apiRateLimitMax: env.API_RATE_LIMIT_MAX,
  frontendDir: path.resolve(env.FRONTEND_DIR),
};
