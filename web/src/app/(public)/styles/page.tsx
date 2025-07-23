import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { BeakerIcon } from '@heroicons/react/24/solid';

export default async function LoginPage() {
  const session = await auth();

  // If already authenticated, redirect to home
  if (session) {
    redirect('/');
  }

  return (
    <div className='min-h-screen flex items-center justify-center  py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-1/2 space-y-8'>
        <BeakerIcon className='size-6 text-ucd-cabernet' />
        <div>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5>Heading 5</h5>
          <h6>Heading 6</h6>

          <p className='lede'>Leading text here</p>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged.
          </p>
          <h2>Buttons</h2>
          <button className='btn btn-neutral'>Neutral</button>
          <button className='btn btn-primary'>Primary</button>
          <button className='btn btn-secondary'>Secondary</button>
          <button className='btn btn-accent'>Accent</button>
          <button className='btn btn-info'>Info</button>
          <button className='btn btn-success'>Success</button>
          <button className='btn btn-warning'>Warning</button>
          <button className='btn btn-error'>Error</button>

          <h2>Links</h2>
          <button className='btn btn-ghost'>Ghost</button>
          <button className='btn btn-link'>Link</button>
          <p>
            Tailwind CSS resets the style of links by default.
            <br />
            Add "link" class to make it look like a
            <a className='link'>normal link</a>
            again.
          </p>
          <h2>Cards</h2>
          <br />
          <div className='card bg-base-100 w-96 shadow-sm'>
            <figure>
              <img
                src='https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp'
                alt='Shoes'
              />
            </figure>
            <div className='card-body'>
              <h2 className='card-title'>Card Title</h2>
              <p>
                A card component has a figure, a body part, and inside body
                there are title and actions parts
              </p>
              <div className='card-actions justify-end'>
                <button className='btn btn-primary'>Buy Now</button>
              </div>
            </div>
          </div>
          <br />
          <h2>Badges</h2>
          <div className='badge badge-primary'>Primary</div>
          <div className='badge badge-secondary'>Secondary</div>
          <div className='badge badge-accent'>Accent</div>
          <div className='badge badge-neutral'>Neutral</div>
          <div className='badge badge-info'>Info</div>
          <div className='badge badge-success'>Success</div>
          <div className='badge badge-warning'>Warning</div>
          <div className='badge badge-error'>Error</div>

          <div className='badge badge-outline badge-primary'>Primary</div>
          <div className='badge badge-outline badge-secondary'>Secondary</div>
          <div className='badge badge-outline badge-accent'>Accent</div>
          <div className='badge badge-outline badge-info'>Info</div>
          <div className='badge badge-outline badge-success'>Success</div>
          <div className='badge badge-outline badge-warning'>Warning</div>
          <div className='badge badge-outline badge-error'>Error</div>
          <br />
          <h2>Alerts</h2>
          <div role='alert' className='alert alert-info alert-soft'>
            <span>12 unread messages. Tap to see.</span>
          </div>
          <div role='alert' className='alert alert-success alert-soft'>
            <span>Your purchase has been confirmed!</span>
          </div>
          <div role='alert' className='alert alert-warning alert-soft'>
            <span>Warning: Invalid email address!</span>
          </div>
          <div role='alert' className='alert alert-error alert-soft'>
            <span>Error! Task failed successfully.</span>
          </div>

          <div role='alert' className='alert alert-info'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='h-6 w-6 shrink-0 stroke-current'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
            <span>New software update available.</span>
          </div>
          <div role='alert' className='alert'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              className='stroke-info h-6 w-6 shrink-0'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
            <span>12 unread messages. Tap to see.</span>
          </div>
          <h2>Fieldset</h2>
          <fieldset className='fieldset'>
            <legend className='fieldset-legend'>Page title</legend>
            <input
              type='text'
              className='input'
              placeholder='My awesome page'
            />
            <p className='label'>
              You can edit page title later on from settings
            </p>
          </fieldset>
          <fieldset className='fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4'>
            <legend className='fieldset-legend'>Page details</legend>

            <label className='label'>Title</label>
            <input
              type='text'
              className='input'
              placeholder='My awesome page'
            />

            <label className='label'>Slug</label>
            <input
              type='text'
              className='input'
              placeholder='my-awesome-page'
            />

            <label className='label'>Author</label>
            <input type='text' className='input' placeholder='Name' />
          </fieldset>
          <fieldset className='fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4'>
            <legend className='fieldset-legend'>Login</legend>

            <label className='label'>Email</label>
            <input type='email' className='input' placeholder='Email' />

            <label className='label'>Password</label>
            <input type='password' className='input' placeholder='Password' />

            <button className='btn btn-neutral mt-4'>Login</button>
          </fieldset>

          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-primary'
          />
          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-secondary'
          />
          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-accent'
          />
          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-neutral'
          />

          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-info'
          />
          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-success'
          />
          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-warning'
          />
          <input
            type='checkbox'
            defaultChecked
            className='checkbox checkbox-error'
          />
        </div>
      </div>
    </div>
  );
}
