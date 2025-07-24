import { auth } from '@/server/auth';
import { apiCaller } from '@/server/trpc/server';
import Link from 'next/link';

export default async function ProtectedPage() {
  const session = await auth();
  const hello = await apiCaller.sample.getProtectedMessage();

  return (
    <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      {/* Homepage Link */}
      <div className='absolute top-4 left-4 z-10'>
        <Link href='/' className='btn btn-ghost btn-sm'>
          <svg
            className='w-4 h-4 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
            />
          </svg>
          Home
        </Link>
      </div>

      <div className='w-full max-w-md space-y-8 text-center'>
        {/* Hello Message */}
        <section>
          <h1 className='text-4xl font-bold mb-4'>{hello}</h1>
        </section>

        {/* User Welcome */}
        {session && (
          <div className='card bg-base-100 shadow-md'>
            <div className='card-body'>
              <div className='flex items-center justify-center space-x-2'>
                <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                <span>
                  Logged in as{' '}
                  <span className='font-semibold text-primary'>
                    {session.user?.name} ({session.user?.email})
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
