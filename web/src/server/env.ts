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

  // UC Davis CAS
  AUTH_UCD_CAS_URL: z.url(),
  AUTH_UCD_CAS_CLIENT_ID: z.string().min(1),
  AUTH_UCD_CAS_CLIENT_SECRET: z.string().min(1),

  // Microsoft Entra ID
  AUTH_UCD_ENTRA_CLIENT_ID: z.string().min(1),
  AUTH_UCD_ENTRA_CLIENT_SECRET: z.string().min(1),
  AUTH_UCD_ENTRA_ISSUER: z.string().min(1),

  // Logging
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
