import { signIn } from '@/server/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';

export default async function LoginPage() {
  const session = await auth();

  // If already authenticated, redirect to home
  if (session) {
    redirect('/');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600 dark:text-gray-400'>
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
            <button
              type='submit'
              className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
            >
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
            <button
              type='submit'
              className='group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
            >
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

        <div className='mt-6'>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300 dark:border-gray-600' />
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400'>
                Secure authentication
              </span>
            </div>
          </div>
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
