import { sampleRouter } from './routes/sample';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  // Define your routers here
  sample: sampleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
