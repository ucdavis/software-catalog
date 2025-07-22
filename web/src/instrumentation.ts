import { logger } from '@/lib/logger';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const shutdown = async (err: unknown) => {
    logger.fatal({ err }, 'uncaught'); // includes context automatically
    // flush if using async transports
    await logger.flush();
    process.exit(1);
  };
  process.on('uncaughtException', shutdown);
  process.on('unhandledRejection', shutdown);
}
