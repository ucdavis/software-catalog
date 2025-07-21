import { z } from 'zod';

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@/server/trpc/trpc';
import { logger } from '@/lib/logger';

let count = 42;

export const sampleRouter = createTRPCRouter({
  getMessage: publicProcedure.query(() => {
    logger.info('getMessage called');
    return 'Hello, App Template!';
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

  getUsers: publicProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
  }),

  changeMyUserName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new Error('Unauthorized');
      }
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { name: input.name },
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }),

  getCount: protectedProcedure.query(() => {
    return count;
  }),

  incrementCount: protectedProcedure.mutation(() => {
    return ++count;
  }),
});
