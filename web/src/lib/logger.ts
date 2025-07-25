import { env } from '@/server/env';
import pino, { Logger, StreamEntry } from 'pino';
import pinoElastic from 'pino-elasticsearch';
import { ecsFormat } from '@elastic/ecs-pino-format';

/**
 * Generates an index name string for logs based on the provided ISO timestamp.
 *
 * The index name is constructed in the format: `logs-<APP_NAME>-<YYYY>-<MM>`,
 * where `<APP_NAME>` is taken from the environment variable `APP_NAME`,
 * `<YYYY>` is the 4-digit year, and `<MM>` is the 2-digit month extracted from the given ISO time.
 *
 * @param isoTime - An ISO 8601 formatted date-time string.
 * @returns The generated index name string.
 */
const getIndexName = (isoTime: string) => {
  const d = new Date(isoTime);
  return `logs-${env.APP_NAME}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const productionLogStreams: StreamEntry[] = [
  { stream: process.stdout }, // always stream to stdout
];

const isProd = process.env.NODE_ENV === 'production';
const hasElastic = !!process.env.LOG_ELASTIC_URL && isProd;

if (hasElastic) {
  /* Add ES stream only when the URL is present and we are in prod */
  productionLogStreams.push({
    level: env.LOG_LEVEL, // can change to make elastic logs a custom level
    stream: pinoElastic({
      index: getIndexName,
      node: process.env.LOG_ELASTIC_URL,
      esVersion: 8, // adjust or supposedly you can remove to auto-detect
      flushBytes: 1000,
    }),
  });
}

export const logger: Logger = isProd
  ? pino(
      { level: env.LOG_LEVEL, ...ecsFormat() }, // ECS JSON everywhere
      pino.multistream(productionLogStreams, { dedupe: true }) // dedupe avoids dup lines
    )
  : pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    });
