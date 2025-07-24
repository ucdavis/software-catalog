import { useFieldContext } from './formContext';

export function TextField({ label }: { label: string }) {
  const field = useFieldContext<string>();
  const hasError = !field.state.meta.isValid;

  return (
    <div className='form-control w-full'>
      <label className='label'>
        <span className='label-text font-medium'>{label}</span>
      </label>
      <input
        type='text'
        placeholder={`Enter ${label.toLowerCase()}`}
        className={`input input-bordered w-full ${
          hasError ? 'input-error' : ''
        }`}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {hasError && (
        <label className='label'>
          <span className='label-text-alt text-error' role='alert'>
            {field.state.meta.errors.join(', ')}
          </span>
        </label>
      )}
    </div>
  );
}
