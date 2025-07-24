import ClientForm from './clientForm';
import Link from 'next/link';

export default function ClientPage() {
  // No prefetching or hydration here - everything happens on the client
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
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

      <div className='text-center max-w-md w-full px-4'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Welcome to the Client Page
        </h1>
        <ClientForm />
      </div>
    </div>
  );
}
