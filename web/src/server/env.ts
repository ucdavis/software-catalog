import { z } from 'zod';

const envSchema = z.object({
  // General
  APP_NAME: z.string().min(1).default('app-template'),

  // Database
  DATABASE_URL: z.url(),

  // NextAuth
  AUTH_SECRET: z.string().min(1),
  // AUTH_URL: z.url().min(1),
  // AUTH_TRUST_HOST: z.string().min(1).optional(),

  // UC Davis CAS (optional - but one auth method must be provided)
  AUTH_UCD_CAS_URL: z.url().optional(),
  AUTH_UCD_CAS_CLIENT_ID: z.string().min(1).optional(),
  AUTH_UCD_CAS_CLIENT_SECRET: z.string().min(1).optional(),

  // Microsoft Entra ID (optional - but one auth method must be provided)
  AUTH_UCD_ENTRA_CLIENT_ID: z.string().min(1).optional(),
  AUTH_UCD_ENTRA_CLIENT_SECRET: z.string().min(1).optional(),
  AUTH_UCD_ENTRA_ISSUER: z.string().min(1).optional(),

  // Logging
  LOG_ENV: z
    .enum(['local', 'development', 'test', 'staging', 'production'])
    .default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_ELASTIC_URL: z.url().optional().default('http://localhost:9200'),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});
export const env = envSchema.parse(process.env);

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
