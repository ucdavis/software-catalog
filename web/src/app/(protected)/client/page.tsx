import ClientForm from './clientForm';

export default function ClientPage() {
  // No prefetching or hydration here - everything happens on the client
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='text-center max-w-md w-full px-4'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Welcome to the Client Page
        </h1>
        <ClientForm />
      </div>
    </div>
  );
}
