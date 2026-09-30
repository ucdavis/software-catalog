import { z } from 'zod';
import { fetchJson } from '@/lib/api.ts';

const forecastsSchema = z.array(
  z.object({
    date: z.iso.date(),
    summary: z.string().nullable(),
    temperatureC: z.number(),
    temperatureF: z.number(),
  })
);

export type Forecast = z.infer<typeof forecastsSchema>[number];

export const weatherQueryOptions = (userId: string) => ({
  queryFn: async ({ signal }: { signal: AbortSignal }) =>
    forecastsSchema.parse(
      await fetchJson<unknown>('/api/weatherforecast', {}, signal)
    ),
  queryKey: ['weather', userId] as const,
  retry: false,
  staleTime: 5 * 60_000,
});
