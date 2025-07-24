import { signIn } from '@/server/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { BeakerIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function LoginPage() {
  const session = await auth();

  // If already authenticated, redirect to home
  if (session) {
    redirect('/');
  }

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

      <div className='max-w-md w-full space-y-8'>
        <div>
          <BeakerIcon className='size-6 text-ucd-cabernet' />
          <h2 className='mt-6 text-center'>Sign in to your account</h2>
          <p className='mt-2 text-center'>
            Choose your preferred sign-in method
          </p>
        </div>

        <div className='mt-8 space-y-4'>
          <form
            action={async () => {
              'use server';
              await signIn('microsoft-entra-id', { redirectTo: '/' });
            }}
          >
            <button type='submit' className='btn btn-primary w-full'>
              <svg
                className='w-5 h-5 mr-2'
                viewBox='0 0 23 23'
                fill='currentColor'
              >
                <path d='M11.03 0H0v11.03h11.03V0zm0 12.97H0V24h11.03V12.97zm12.94-12.97H12.97v11.03h11v-11.03zm0 12.97H12.97V24h11V12.97z' />
              </svg>
              Sign in with Microsoft Entra ID
            </button>
          </form>

          <form
            action={async () => {
              'use server';
              await signIn('ucdcas', { redirectTo: '/' });
            }}
          >
            <button type='submit' className='btn btn-secondary w-full'>
              <svg
                className='w-5 h-5 mr-2'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' />
              </svg>
              Sign in with UC Davis CAS
            </button>
          </form>
        </div>

        <div className='text-center text-xs text-gray-500 dark:text-gray-400'>
          <p>
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
