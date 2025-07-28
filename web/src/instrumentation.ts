// Setup logging for global crash handlers
// This will run in Node.js and edge runtimes but we only want to actually load the crash handlers in Node.js

import type { Instrumentation } from 'next';

// see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { register } = await import('./instrumentation.node');
  return register();
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { onRequestError } = await import('./instrumentation.node');
  return onRequestError(err, request, context);
};
