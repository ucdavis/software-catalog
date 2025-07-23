import { BeakerIcon } from '@heroicons/react/24/solid';

export default async function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-1/2 space-y-8'>
        <BeakerIcon className='size-6 text-ucd-cabernet' />
        {/* Typography */}
        <section>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <p>This is a paragraph of base text.</p>
          <p>This is small, muted text.</p>
        </section>

        {/* Buttons */}
        <section className='space-x-2'>
          <button className='btn btn-primary'>Primary</button>
          <button className='btn btn-secondary'>Secondary</button>
          <button className='btn btn-accent'>Accent</button>
          <button className='btn btn-outline'>Outline</button>
          <button className='btn btn-disabled'>Disabled</button>
        </section>

        {/* Inputs */}
        <section className='space-y-2'>
          <input
            type='text'
            placeholder='Text input'
            className='input input-bordered w-full max-w-xs'
          />
        </section>

        {/* Cards */}
        <section className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='card bg-base-100 shadow-md'>
            <div className='card-body'>
              <h2 className='card-title'>Card Title</h2>
              <p>This is a card with some content and a button.</p>
              <div className='card-actions justify-end'>
                <button className='btn btn-primary'>Go</button>
              </div>
            </div>
          </div>
          <div className='card bg-neutral text-neutral-content'>
            <div className='card-body'>
              <h2 className='card-title'>Dark Card</h2>
              <p>This one uses the neutral theme colors.</p>
            </div>
          </div>
        </section>

        {/* Alerts */}
        <section className='space-y-2'>
          <div className='alert alert-info'>
            <span>Info alert message</span>
          </div>
          <div className='alert alert-success'>
            <span>Success alert message</span>
          </div>
          <div className='alert alert-warning'>
            <span>Warning alert message</span>
          </div>
          <div className='alert alert-error'>
            <span>Error alert message</span>
          </div>
        </section>

        {/* Badges */}
        <section className='space-x-2'>
          <div className='badge badge-primary'>Primary</div>
          <div className='badge badge-secondary'>Secondary</div>
          <div className='badge badge-accent'>Accent</div>
          <div className='badge badge-outline'>Outline</div>
        </section>
      </div>
    </div>
  );
}
