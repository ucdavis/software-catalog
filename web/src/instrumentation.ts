// Setup logging for global crash handlers
// This will run in Node.js and edge runtimes but we only want to actually load the crash handlers in Node.js
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { initCrashHandlers } = await import('./instrumentation.node');
  initCrashHandlers();
}
