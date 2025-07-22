import Link from 'next/link';

export default function PublicPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800'>
      <div className='bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center max-w-md w-full border border-gray-200 dark:border-slate-700'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
          This is a publicly accessible page
        </h1>
        <p className='text-gray-600 dark:text-gray-300 mb-8'>
          Anyone can view this page without logging in.
        </p>
        <Link
          href='/'
          className='inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors'
        >
          View Homepage (requires login)
        </Link>
      </div>
    </div>
  );
}
