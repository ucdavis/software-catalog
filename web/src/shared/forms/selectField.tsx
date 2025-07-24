import { useFieldContext } from './formContext';

interface SelectFieldProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectField({ label, options, placeholder }: SelectFieldProps) {
  const field = useFieldContext<string>();
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className='form-control w-full'>
      <label className='label'>
        <span className='label-text font-medium'>{label}</span>
      </label>
      <select
        className={`select select-bordered w-full ${
          hasError ? 'select-error' : ''
        }`}
        value={field.state.value || ''}
        onChange={(e) => field.handleChange(e.target.value)}
      >
        <option value='' disabled>
          {placeholder ?? `Pick a ${label.toLowerCase()}`}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
