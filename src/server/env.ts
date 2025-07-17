import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),

  // UC Davis CAS
  AUTH_UCD_CAS_URL: z.string().url(),
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
