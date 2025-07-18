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
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  debug: true,
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  providers: [
    MicrosoftEntraID({
      id: 'microsoft-entra-id',
      name: 'UC Davis - Microsoft Entra ID',
      clientId: env.AUTH_UCD_ENTRA_CLIENT_ID,
      clientSecret: env.AUTH_UCD_ENTRA_CLIENT_SECRET,
      issuer: env.AUTH_UCD_ENTRA_ISSUER,
    }),
    {
      id: 'ucdcas',
      name: 'UC Davis CAS',
      type: 'oidc',
      issuer: env.AUTH_UCD_CAS_URL,
      clientId: env.AUTH_UCD_CAS_CLIENT_ID,
      clientSecret: env.AUTH_UCD_CAS_CLIENT_SECRET,
    },
  ],
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
