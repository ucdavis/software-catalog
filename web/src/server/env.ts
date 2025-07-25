import { z } from 'zod';

const envSchema = z
  .object({
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
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    LOG_ELASTIC_URL: z.url().optional().default('http://localhost:9200'),

    // Node environment
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
  })
  .refine(
    (data) => {
      // Check if CAS credentials are complete
      const hasCas = !!(
        data.AUTH_UCD_CAS_URL &&
        data.AUTH_UCD_CAS_CLIENT_ID &&
        data.AUTH_UCD_CAS_CLIENT_SECRET
      );

      // Check if Entra ID credentials are complete
      const hasEntra = !!(
        data.AUTH_UCD_ENTRA_CLIENT_ID &&
        data.AUTH_UCD_ENTRA_CLIENT_SECRET &&
        data.AUTH_UCD_ENTRA_ISSUER
      );

      // At least one auth method must be configured
      return hasCas || hasEntra; // OR: true if at least one is true
    },
    {
      message:
        'At least one complete authentication method must be provided: either UC Davis CAS credentials (URL, CLIENT_ID, CLIENT_SECRET) or Microsoft Entra ID credentials (CLIENT_ID, CLIENT_SECRET, ISSUER), or both.',
    }
  );

export const env = envSchema.parse(process.env);

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
