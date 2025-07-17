import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.url(),

  // NextAuth
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.url().min(1),
  AUTH_TRUST_HOST: z.string().min(1).optional(),

  // UC Davis CAS
  AUTH_UCD_CAS_URL: z.url(),
  AUTH_UCD_CAS_CLIENT_ID: z.string().min(1),
  AUTH_UCD_CAS_CLIENT_SECRET: z.string().min(1),

  // Node environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export const env = envSchema.parse(process.env);

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
