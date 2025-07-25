import { PrismaAdapter } from '@auth/prisma-adapter';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

import { db } from '@/server/db';
import { env } from '../env';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Build the providers array based on available environment variables
 */
const buildProviders = () => {
  const providers = [];

  // Add Microsoft Entra ID provider if credentials are available
  if (
    env.AUTH_UCD_ENTRA_CLIENT_ID &&
    env.AUTH_UCD_ENTRA_CLIENT_SECRET &&
    env.AUTH_UCD_ENTRA_ISSUER
  ) {
    providers.push(
      MicrosoftEntraID({
        id: 'microsoft-entra-id',
        name: 'UC Davis - Microsoft Entra ID',
        clientId: env.AUTH_UCD_ENTRA_CLIENT_ID,
        clientSecret: env.AUTH_UCD_ENTRA_CLIENT_SECRET,
        issuer: env.AUTH_UCD_ENTRA_ISSUER,
      })
    );
  }

  // Add UC Davis CAS provider if credentials are available
  if (
    env.AUTH_UCD_CAS_URL &&
    env.AUTH_UCD_CAS_CLIENT_ID &&
    env.AUTH_UCD_CAS_CLIENT_SECRET
  ) {
    providers.push({
      id: 'ucdcas',
      name: 'UC Davis CAS',
      type: 'oidc' as const,
      issuer: env.AUTH_UCD_CAS_URL,
      clientId: env.AUTH_UCD_CAS_CLIENT_ID,
      clientSecret: env.AUTH_UCD_CAS_CLIENT_SECRET,
    });
  }

  // This should never happen due to env validation, but adding as a safety check
  if (providers.length === 0) {
    throw new Error(
      'No authentication providers configured. At least one of Microsoft Entra ID or UC Davis CAS must be properly configured.'
    );
  }

  return providers;
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  // debug: true, // Enable debug messages in the console if you are fighting authentication issues
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: buildProviders(),
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
