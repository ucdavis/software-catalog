import { QueryClient } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { meQueryOptions } from '@/queries/user.ts';
import { weatherQueryOptions } from '@/queries/weather.ts';

afterEach(() => vi.unstubAllGlobals());

it.each(['user', 'weather'])(
  'aborts the %s HTTP request when its query is canceled',
  async (kind) => {
    let started!: () => void;
    const requestStarted = new Promise<void>((resolve) => {
      started = resolve;
    });
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            requestSignal = init.signal ?? undefined;
            requestSignal?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true }
            );
            started();
          })
      )
    );
    const client = new QueryClient();
    const options =
      kind === 'user' ? meQueryOptions() : weatherQueryOptions('user-1');
    // Observe query cancellation immediately so it cannot become an unhandled rejection.
    const result =
      kind === 'user'
        ? client.fetchQuery(meQueryOptions()).catch((error: unknown) => error)
        : client
            .fetchQuery(weatherQueryOptions('user-1'))
            .catch((error: unknown) => error);
    try {
      await requestStarted;
      await client.cancelQueries({ queryKey: options.queryKey });
      await result;
      expect(requestSignal?.aborted).toBe(true);
    } finally {
      client.clear();
    }
  }
);
