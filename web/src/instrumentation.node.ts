import 'server-only'; // hard-ban client / edge import
import { logger } from '@/lib/logger';

export function initCrashHandlers() {
  const shutdown = async (err: unknown) => {
    logger.fatal({ err }, 'uncaught');
    // flush if you add an async transport later:
    if (typeof logger.flush === 'function') await logger.flush();
    process.exit(1);
  };
  process.on('uncaughtException', shutdown);
  process.on('unhandledRejection', shutdown);
}
