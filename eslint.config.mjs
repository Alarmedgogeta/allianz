import { defineConfig, globalIgnores } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// eslint-config-next (flat config) already registers these plugins.
// Strip them from Airbnb's legacy compat output to avoid ESLint 9's
// "Cannot redefine plugin" error.
const NEXT_OWNED_PLUGINS = new Set([
  'jsx-a11y',
  'import',
  'react',
  'react-hooks',
]);

const airbnbConfig = compat.extends('airbnb', 'airbnb/hooks').map((config) => {
  if (!config.plugins) return config;
  const plugins = Object.fromEntries(
    Object.entries(config.plugins).filter(
      ([key]) => !NEXT_OWNED_PLUGINS.has(key),
    ),
  );
  return { ...config, plugins };
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...airbnbConfig,
  prettierConfig,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      // Next.js provides React in scope globally
      'react/react-in-jsx-scope': 'off',
      // TypeScript handles prop validation
      'react/prop-types': 'off',
      // Allow .ts/.tsx imports without file extensions
      'import/extensions': 'off',
      // tsconfig path aliases are not resolvable by eslint-plugin-import
      'import/no-unresolved': 'off',
      // JSX is valid in .tsx files
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.jsx', '.tsx'] },
      ],
      // Allow devDependencies in config and tooling files
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '*.config.*',
            '*.config.ts',
            '*.config.js',
            '*.config.mjs',
            '**/*.test.*',
            '**/*.spec.*',
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
