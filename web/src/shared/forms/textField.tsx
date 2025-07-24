import { useFieldContext } from './formContext';

interface TextFieldProps {
  label: string;
  placeholder?: string;
}

export function TextField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<string>();
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className='form-control w-full'>
      <label className='label'>
        <span className='label-text font-medium'>{label}</span>
      </label>
      <input
        type='text'
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className={`input input-bordered w-full ${
          hasError ? 'input-error' : ''
        }`}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {hasError && (
        <label className='label'>
          <span className='label-text-alt text-error' role='alert'>
            {field.state.meta.errors.map((err) => err.message).join(', ')}
          </span>
        </label>
      )}
    </div>
  );
}
