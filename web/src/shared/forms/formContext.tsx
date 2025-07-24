import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
import { TextField } from './textField';
import { SubscribeButton } from './submitButton';

// export useFieldContext for use in your custom components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    // text, select, checkbox, etc.
    TextField,
  },
  formComponents: {
    // submit buttons and such
    SubscribeButton,
  },
});

export { useAppForm };
