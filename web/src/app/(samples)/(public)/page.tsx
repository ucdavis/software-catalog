import Image from 'next/image';
import Link from 'next/link';

export default async function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800'>
      <div className='container mx-auto px-4 py-16'>
        {/* Header Section */}
        <header className='text-center mb-16'>
          <div className='mb-8'>
            <Image
              className='mx-auto dark:invert'
              src='/caes.svg'
              alt='App Logo'
              width={419}
              height={77}
              priority
            />
          </div>

          {/* Hero Message */}
          <div className='mb-8'>
            <h1 className='text-5xl font-bold text-gray-900 dark:text-white mb-4'>
              Hello
            </h1>
            <p className='text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
              Welcome to your modern app template. Built with Next.js,
              TypeScript, and tRPC for rapid development.
            </p>
          </div>
        </header>

        {/* Sample Section */}
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-center text-gray-900 dark:text-white mb-12'>
            Sample Pages
          </h2>
          <div className='grid md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            <div className='bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Prefetching Example
              </h3>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                This page demonstrates data prefetching with tRPC and React
                Query.
              </p>
              <Link
                href='/prefetch'
                className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Go to Prefetch Page
              </Link>
            </div>
            <div className='bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Client-Side Example
              </h3>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                This page shows how to handle client-side data fetching and form
                submission.
              </p>
              <Link
                href='/client'
                className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Go to Client Page
              </Link>
            </div>
            <div className='bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6'>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Login Example
              </h3>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                This page requires login to access.
              </p>
              <Link
                href='/protected'
                className='inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                Go to Protected Page
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className='mb-16'>
          <h2 className='text-3xl font-bold text-center text-gray-900 dark:text-white mb-12'>
            What is Included
          </h2>
          <div className='grid md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
            <div className='bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center'>
              <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-6 h-6 text-blue-600 dark:text-blue-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 10V3L4 14h7v7l9-11h-7z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Fast & Modern
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Built with Next.js 15, TypeScript, and modern development
                practices
              </p>
            </div>

            <div className='bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center'>
              <div className='w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-6 h-6 text-green-600 dark:text-green-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Type-Safe API
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                End-to-end type safety with tRPC and automatic API validation
              </p>
            </div>

            <div className='bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center'>
              <div className='w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-6 h-6 text-purple-600 dark:text-purple-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                Secure Auth
              </h3>
              <p className='text-gray-600 dark:text-gray-300'>
                Built-in authentication system with session management
              </p>
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className='text-center mb-16'>
          <div className='bg-gradient-to-br from-blue-100 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-blue-200 dark:border-slate-700'>
            <h2 className='text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4'>
              Getting Started
            </h2>
            <p className='text-gray-700 dark:text-gray-200 mb-6'>
              Start building your own app with this template in just one
              command:
            </p>
            <div className='bg-slate-900 text-left rounded-lg p-4 mb-6 overflow-x-auto'>
              <pre className='text-sm text-blue-200'>
                <code>
                  git clone https://github.com/ucdavis/app-template/ my-app
                </code>
              </pre>
            </div>
            <p className='text-gray-600 dark:text-gray-400 mb-8'>
              This will scaffold a new project using this template, so you can
              get started quickly with all the best practices and tools already
              set up.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <a
                className='inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors'
                href='https://nextjs.org/docs'
                target='_blank'
                rel='noopener noreferrer'
              >
                View Documentation
              </a>
              <a
                className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors'
                href='https://github.com/ucdavis/app-template'
                target='_blank'
                rel='noopener noreferrer'
              >
                View Source
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
