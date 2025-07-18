'use client';
import { useTRPC } from '@/server/trpc/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

export default function ClientForm() {
  // now we are in a client component, so we can use regular react-query to fetch data
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  // useQuery instead of useSuspenseQuery - this will show loading states
  const {
    data: users,
    isLoading,
    error,
  } = useQuery(trpc.sample.getUsers.queryOptions());

  // we can also get our mutation ready for when the user clicks the button
  const incrementCountMutation = useMutation(
    trpc.sample.changeMyUserName.mutationOptions({
      onSuccess: async () => {
        // now that we updated the data we want to invalidate the query to refetch the users
        await queryClient.invalidateQueries(trpc.sample.getUsers.pathFilter());
      },
    })
  );

  if (isLoading) {
    return (
      <div className='max-w-md mx-auto mt-10 p-8 rounded-lg shadow-md'>
        <div className='flex items-center justify-center h-32'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-2 text-gray-600'>Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-md mx-auto mt-10 p-8 rounded-lg shadow-md'>
        <div className='text-center text-red-600'>
          <p>Error loading users: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-md mx-auto mt-10 p-8 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold mb-4 text-gray-900'>
        Client-side Users
      </h2>
      <ul className='space-y-2 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
        {users?.map((user) => (
          <li
            key={user.id}
            className='p-4 bg-green-50 rounded border border-green-100'
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
          disabled={incrementCountMutation.isPending}
        />
        <button
          type='submit'
          disabled={incrementCountMutation.isPending}
          className='px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {incrementCountMutation.isPending ? 'Updating...' : 'Update Name'}
        </button>
      </form>
    </div>
  );
}
