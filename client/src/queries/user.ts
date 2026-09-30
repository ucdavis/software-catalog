import { fetchJson } from '../lib/api.ts';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

const userSchema = z.object({
  email: z
    .string()
    .nullable()
    .transform((value) => value ?? ''),
  iamId: z.string().nullable(),
  id: z.string().min(1),
  name: z
    .string()
    .nullable()
    .transform((value) => value ?? ''),
  roles: z.array(z.string()),
});

export type User = z.infer<typeof userSchema>;

export const meQueryOptions = () => ({
  queryFn: async ({ signal }: { signal: AbortSignal }): Promise<User> => {
    return userSchema.parse(
      await fetchJson<unknown>('/api/user/me', {}, signal)
    );
  },
  queryKey: ['users', 'me'] as const,
  retry: false,
  staleTime: 5 * 60_000, // 5 minutes
});

export const useMeQuery = () => {
  return useQuery(meQueryOptions());
};
