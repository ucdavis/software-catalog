import { z } from 'zod';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/trpc/trpc';

let count = 42;

export const sampleRouter = createTRPCRouter({
  getMessage: publicProcedure.query(() => {
    return 'Hello, world!';
  }),

  getProtectedMessage: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session?.user) {
      throw new Error('Unauthorized');
    }
    return `Hello, ${ctx.session.user.name || 'user'}!`;
  }),

  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .query(({ input }) => {
      return input.message;
    }),

  getCount: protectedProcedure.query(() => {
    return count;
  }),

  incrementCount: protectedProcedure.mutation(() => {
    return ++count;
  }),
});
