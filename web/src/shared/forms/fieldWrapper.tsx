import { ReactNode } from 'react';
import { useFieldContext } from './formContext';

interface FieldWrapperProps {
  label: string;
  children: ReactNode;
}

/**
 * Common wrapper component for form fields that handles label, error display, and validation state
 */
export function FieldWrapper({ label, children }: FieldWrapperProps) {
  const field = useFieldContext<string>();
  const hasError = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <div className='form-control w-full'>
      <label className='label'>
        <span className='label-text font-medium'>{label}</span>
      </label>
      {children}
      {hasError && (
        <label className='label'>
          <span className='label-text-alt text-error' role='alert'>
            {field.state.meta.errors.map((err) => err.message).join(', ')}
          </span>
        </label>
      )}
      {field.state.meta.isValidating && (
        <span className='loading loading-spinner loading-xs ml-2'></span>
      )}
    </div>
  );
}
