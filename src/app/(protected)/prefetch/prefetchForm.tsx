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
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // useSuspenseQuery means we know the data is available immediately because of the prefetch
  const { data: users } = useSuspenseQuery(trpc.sample.getUsers.queryOptions());

  // we can also get our mutation ready for when the user clicks the button
  const incrementCountMutation = useMutation(
    trpc.sample.changeMyUserName.mutationOptions({
      onSuccess: async () => {
        // now that we updated the data we want to invalidate the query to refetch the users (could always set the data directly too, but this is cleaner)
        await queryClient.invalidateQueries(trpc.sample.getUsers.pathFilter());
      },
    })
  );

  return (
    <div className='max-w-md mx-auto mt-10 p-8 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4 text-gray-900'>
        Prefetched Users
      </h2>
      <ul className='space-y-2 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
        {users.map((user) => (
          <li
            key={user.id}
            className='p-4 bg-blue-50 rounded border border-blue-100'
          >
            <p className='text-lg font-semibold text-gray-900'>{user.name}</p>
            <p className='text-sm text-gray-600'>{user.email}</p>
          </li>
        ))}
      </ul>
      <form
        className='flex flex-col items-center gap-4'
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const name = formData.get('name') as string;
          incrementCountMutation.mutate({ name });
        }}
      >
        <input
          type='text'
          name='name'
          className='border rounded px-3 py-2 w-full'
          placeholder='Update your name'
        />
        <button
          type='submit'
          className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold shadow'
        >
          Update Name
        </button>
      </form>
    </div>
  );
}
