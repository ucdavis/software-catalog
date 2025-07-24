import { useFieldContext } from './formContext';
import { FieldWrapper } from './fieldWrapper';

interface SelectFieldProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function SelectField({ label, options, placeholder }: SelectFieldProps) {
  const field = useFieldContext<string>();
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FieldWrapper label={label}>
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
    </FieldWrapper>
  );
}
