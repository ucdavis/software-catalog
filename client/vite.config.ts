import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { env } from 'node:process';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const target = env.ASPNETCORE_URLS
  ? env.ASPNETCORE_URLS.split(';')[0]
  : env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : 'http://localhost:5165';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Zod 4.6.5 mentions @__PURE__ in two explanatory comments. Rollup
        // mistakes those for annotations; the actual call annotations are valid.
        // Remove this exception when Zod fixes the comments upstream.
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          ((warning.id?.endsWith('/node_modules/zod/v4/core/regexes.js') &&
            warning.message.includes(
              'esbuild will not drop a `@__PURE__` call'
            )) ||
            (warning.id?.endsWith('/node_modules/zod/v4/core/util.js') &&
              warning.message.includes('Wrapped in a `@__PURE__` IIFE')))
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  plugins: [
    tanstackRouter({
      autoCodeSplitting: true,
      target: 'react',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    // Let the caller decide whether to open a browser. This avoids a second
    // tab when Visual Studio launches through ASP.NET Core SpaProxy.
    open: false,
    port: 5173,
    proxy: {
      '/health': {
        secure: false,
        target,
      },
      '/login': {
        secure: false,
        target,
      },
      '/logout': {
        secure: false,
        target,
      },
      '/signin-oidc': {
        secure: false,
        target,
      },
      '^/api': {
        secure: false,
        target,
      },
    },
  },
});
