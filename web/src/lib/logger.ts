import { env } from '@/server/env';
import pino, { Logger, StreamEntry } from 'pino';
import pinoElastic from 'pino-elasticsearch';
import { ecsFormat } from '@elastic/ecs-pino-format';

/**
 * Generates an index name string for logs based on the app name and environment.
 *
 * Elastic data streams are named with the format https://www.elastic.co/docs/reference/fleet/data-streams:
 * `<type>-<dataset>-<namespace>`
 * Where:
 * - `<type>` is always `logs`
 * - `<dataset>` is the app name
 * - `<namespace>` is the year and month of the log entry
 */

const getIndexName = () => {
  const appNameNoDashes = env.APP_NAME?.replace(/-/g, '_') || 'unknown_app';
  const log_env = env.LOG_ENV;
  return `logs-${appNameNoDashes}-${log_env}`;
};

const productionLogStreams: StreamEntry[] = [
  { stream: process.stdout }, // always stream to stdout
];

const isProd = process.env.NODE_ENV === 'production';
const hasElastic = !!process.env.LOG_ELASTIC_URL;

if (hasElastic) {
  /* Add ES stream only when the URL is present and we are in prod */
  productionLogStreams.push({
    level: env.LOG_LEVEL, // can change to make elastic logs a custom level
    stream: pinoElastic({
      index: getIndexName(),
      node: process.env.LOG_ELASTIC_URL,
      opType: 'create', // data stream, so always create new entries
      esVersion: 8, // adjust or supposedly you can remove to auto-detect
      flushBytes: 1000,
    }),
  });
}

export const logger: Logger = isProd
  ? pino(
      {
        level: env.LOG_LEVEL,
        ...ecsFormat(),
        base: {
          app: env.APP_NAME,
          env: env.LOG_ENV,
          // Add any other base properties you want to log with every log entry
        },
      }, // ECS JSON everywhere
      pino.multistream(productionLogStreams, { dedupe: true }) // dedupe avoids dup lines
    )
  : pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    });

logger.info(
  `Logger initialized with level: ${env.LOG_LEVEL}, environment: ${env.LOG_ENV}, app: ${env.APP_NAME}. Using elastic? ${isProd && hasElastic ? 'yes' : 'no'}.`
);
