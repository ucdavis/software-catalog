import 'server-only'; // hard-ban client / edge import
import { logger } from '@/lib/logger';
import { Instrumentation } from 'next';

export const patchConsole = () => {
  // Patch console methods to use the logger
  // so if someone uses console.log, console.error, etc, it will go to the logger
  const logMethods = ['log', 'info', 'warn', 'error', 'debug'] as const;

  const map: Record<(typeof logMethods)[number], keyof typeof logger> = {
    log: 'info',
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: 'debug',
  };

  for (const method of logMethods) {
    const loggerMethod = map[method];
    if (loggerMethod && typeof logger[loggerMethod] === 'function') {
      console[method] = logger[loggerMethod].bind(logger);
    }
  }
};

export const initCrashHandlers = () => {
  const shutdown = async (err: unknown) => {
    logger.fatal({ err }, 'uncaught');
    // flush if you add an async transport later:
    if (typeof logger.flush === 'function') await logger.flush();
    process.exit(1);
  };
  process.on('uncaughtException', shutdown);
  process.on('unhandledRejection', shutdown);
  process.on('beforeExit', shutdown);
};

export const register = async () => {
  // register all of our instrumentation in one fn, for simplicity
  initCrashHandlers();
  patchConsole();
};

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  logger.error(
    { err, request, context },
    'Next.js caught an unhandled error (onRequestError)'
  );
  if (typeof logger.flush === 'function') await logger.flush();
};
