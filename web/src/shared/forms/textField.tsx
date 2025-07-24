import { useFieldContext } from './formContext';
import { FieldWrapper } from './fieldWrapper';

interface TextFieldProps {
  label: string;
  placeholder?: string;
}

export function TextField({ label, placeholder }: TextFieldProps) {
  const field = useFieldContext<string>();
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FieldWrapper label={label}>
      <input
        type='text'
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        className={`input input-bordered w-full ${
          hasError ? 'input-error' : ''
        }`}
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
    </FieldWrapper>
  );
}
