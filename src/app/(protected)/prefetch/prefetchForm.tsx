'use client';
import { useTRPC } from '@/server/trpc/react';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import React from 'react';

export default function PrefetchForm() {
  // now we are in a client component, so we can use regular react-query to fetch data
  const trpc = useTRPC();

  const queryClient = useQueryClient();

  // useSuspenseQuery means we know the data is available immediately because of the prefetch
  const { data } = useSuspenseQuery(trpc.sample.getCount.queryOptions());

  // we can also get our mutation ready for when the user clicks the button
  const incrementCountMutation = useMutation(
    trpc.sample.incrementCount.mutationOptions({
      onSuccess: async () => {
        // now that we updated the data we want to refetch the count.  or we could set it directly, etc
        await queryClient.invalidateQueries(trpc.sample.getCount.pathFilter());
      },
    })
  );

  console.log('PrefetchForm data:', data);

  return (
    <div className='max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-md'>
      <p className='text-lg text-gray-600 mb-8 text-center'>{data}</p>
      <form className='flex flex-col items-center gap-4'>
        <button
          type='button'
          className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold shadow'
          onClick={() => {
            incrementCountMutation.mutate();
          }}
        >
          Increment Count
        </button>
      </form>
    </div>
  );
}
