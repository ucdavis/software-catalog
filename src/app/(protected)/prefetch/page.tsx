import { HydrateClient, prefetch, trpc } from '@/server/trpc/server';
import PrefetchForm from './prefetchForm';

export default async function PrefetchPage() {
  // this will "start" the query on the server and automatically hydrate it on the client
  // note we need to wrap the component in HydrateClient to use the prefetch
  prefetch(trpc.sample.getCount.queryOptions());
  return (
    <HydrateClient>
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center max-w-md w-full px-4'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Welcome to the Prefetch Page
          </h1>
          <PrefetchForm />
        </div>
      </div>
    </HydrateClient>
  );
}
