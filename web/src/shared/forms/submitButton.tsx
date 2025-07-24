import { useFormContext } from './formContext';

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <button
          type='submit'
          disabled={isSubmitting}
          className='btn btn-primary w-full'
        >
          {isSubmitting ? (
            <>
              <span className='loading loading-spinner loading-xs mr-2'></span>
              Submitting...
            </>
          ) : (
            label
          )}
        </button>
      )}
    </form.Subscribe>
  );
}
