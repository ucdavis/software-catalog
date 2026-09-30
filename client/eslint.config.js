import nkzw from '@nkzw/eslint-config';
import pluginRouter from '@tanstack/eslint-plugin-router';
import pluginQuery from '@tanstack/eslint-plugin-query';

export default [
  ...pluginQuery.configs['flat/recommended'],
  ...pluginRouter.configs['flat/recommended'],
  ...nkzw,
  {
    ignores: ['dist/', 'vite.config.ts.timestamp-*', 'src/routeTree.gen.ts'],
  },
  {
    rules: {
      // The core rule treats TypeScript function-type parameter names as variables.
      '@typescript-eslint/no-unused-vars': 'error',
      'no-unused-vars': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
];
