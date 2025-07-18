'use client';
import { useTRPC } from '@/server/trpc/react';
import { useSuspenseQuery } from '@tanstack/react-query';
import React from 'react';

export default function PrefetchForm() {
  // now we are in a client component, so we can use regular react-query to fetch data
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(trpc.sample.getCount.queryOptions());

  console.log('PrefetchForm data:', data);

  return (
    <>
      <p className='text-lg text-gray-600 mb-8'>{data}</p>
    </>
  );
}
