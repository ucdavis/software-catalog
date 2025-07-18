import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  // Define your routers here
});

// export type definition of API
export type AppRouter = typeof appRouter;
