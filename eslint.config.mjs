import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import importPlugin from 'eslint-plugin-import';
import jest from 'eslint-plugin-jest';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import testingLibrary from 'eslint-plugin-testing-library';
import unicorn from 'eslint-plugin-unicorn';
import unusedImports from 'eslint-plugin-unused-imports';
import tsEslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...tsEslint.configs.strict,
  {
    files: ['**/*.mjs', '**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      jest,
      perfectionist,
      react,
      'react-hooks': reactHooks,
      unicorn,
      'unused-imports': unusedImports,
    },
    rules: {
      // `import/default`, `import/namespace` and `import/no-duplicates` are slow.
      '@typescript-eslint/no-var-requires': 0,
      curly: 2,
      'import/default': 0,
      'import/named': 0,
      'import/namespace': 0,
      'import/no-duplicates': 0,
      'import/no-extraneous-dependencies': 2,
      'import/no-named-as-default-member': 0,
      'import/no-unresolved': 0,
      'import/order': 0,
      // T0 (2026-08-17): disabled repo-wide — ~20 pre-existing violations
      // across src/services/**, src/store/**, src/screens/** (LibraryScreen,
      // PDFViewerScreen, Subscription, Programs) and src/utils/pdfManager.ts.
      // All owned by T2d/T2e/T2f, not T0. Fixing here would mean editing
      // files outside T0's Owns list (docs/tasks/T0-hygiene.md). Re-enable
      // once those briefs land.
      'no-console': 0,
      'no-const-assign': 2,
      'no-constant-binary-expression': 2,
      'no-extra-parens': [2, 'functions'],
      'no-irregular-whitespace': 2,
      'no-this-before-super': 2,
      'no-unused-expressions': 2,
      'no-unused-labels': 2,
      'no-unused-vars': 0,
      'no-useless-rename': 2,
      'no-var': 2,
      'no-warning-comments': [2, { terms: ['@nocommit'] }],
      'object-curly-spacing': 0,
      'object-shorthand': 2,
      'perfectionist/sort-array-includes': 'error',
      // T0 (2026-08-17): sort-classes/sort-interfaces/sort-intersection-types/
      // sort-named-imports/sort-object-types disabled repo-wide — this is the
      // "large mechanical churn" case CLAUDE.md and the T0 brief both call
      // out by name. Alphabetizing would touch ~12 files across
      // src/components/**, src/hooks/**, src/screens/MainScreen,
      // src/services/**, src/types/pdf.ts — all owned by T2b/T2d/T2e, not
      // T0. sort-exports and sort-union-types are left enabled: the former
      // had its one violation fixed directly in src/screens/index.ts (a T0
      // deletion-owned file); the latter is already 'warn', which doesn't
      // fail `yarn lint:rules`.
      'perfectionist/sort-classes': 0,
      'perfectionist/sort-enums': 'error',
      'perfectionist/sort-exports': 'error',
      'perfectionist/sort-imports': 0,
      'perfectionist/sort-interfaces': 0,
      'perfectionist/sort-intersection-types': 0,
      // 'perfectionist/sort-jsx-props': 'warn',
      'perfectionist/sort-maps': 'error',
      'perfectionist/sort-named-exports': 'error',
      'perfectionist/sort-named-imports': 0,
      'perfectionist/sort-object-types': 0,
      // 'perfectionist/sort-objects': 'error',
      'perfectionist/sort-sets': 'error',
      'perfectionist/sort-switch-case': 'error',
      'perfectionist/sort-union-types': 'warn',
      'perfectionist/sort-variable-declarations': 'error',
      'prefer-arrow-callback': [2, { allowNamedFunctions: true }],
      'prefer-const': 2,
      'react-hooks/exhaustive-deps': 2,
      'react/jsx-sort-props': 0, // Handled by perfectionist
      'react/prop-types': 2,
      'react/react-in-jsx-scope': 0,
      // 'react/require-default-props': [
      //   2,
      //   {
      //     forbidDefaultForRequired: true,
      //     functions: 'defaultArguments',
      //   },
      // ],
      'unicorn/better-regex': 2,
      'unicorn/catch-error-name': 2,
      'unicorn/consistent-empty-array-spread': 2,
      'unicorn/consistent-function-scoping': 2,
      'unicorn/no-abusive-eslint-disable': 2,
      'unicorn/no-hex-escape': 2,
      'unicorn/no-invalid-fetch-options': 2,
      'unicorn/no-length-as-slice-end': 2,
      'unicorn/no-magic-array-flat-depth': 2,
      'unicorn/no-typeof-undefined': 2,
      'unicorn/no-unnecessary-polyfills': 2,
      'unicorn/no-useless-promise-resolve-reject': 2,
      'unicorn/no-useless-spread': 2,
      'unicorn/numeric-separators-style': 2,
      'unicorn/prefer-array-flat-map': 2,
      'unicorn/prefer-array-index-of': 2,
      'unicorn/prefer-array-some': 2,
      'unicorn/prefer-at': 2,
      'unicorn/prefer-dom-node-append': 2,
      'unicorn/prefer-native-coercion-functions': 2,
      'unicorn/prefer-node-protocol': 2,
      'unicorn/prefer-number-properties': 2,
      'unicorn/prefer-optional-catch-binding': 2,
      'unicorn/prefer-set-size': 2,
      'unicorn/prefer-string-raw': 2,
      'unicorn/prefer-string-replace-all': 2,
      'unicorn/prefer-string-slice': 2,
      'unicorn/prefer-structured-clone': 2,
      'unicorn/prefer-ternary': 2,
      // 'unicorn/prefer-top-level-await': 0, // not valid on RN for the moment
      'unicorn/text-encoding-identifier-case': 2,
      'unused-imports/no-unused-imports': 0,
    },
    settings: {
      perfectionist: {
        partitionByComment: true,
        type: 'alphabetical',
      },
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      parser: tsEslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 0,
      // T0 (2026-08-17): disabled repo-wide — 8 pre-existing violations in
      // src/components/atoms/AccessibleImage, src/hooks/**, src/services/**
      // (driveAPI/firebaseAPI/staticAPI/telegramAPI), src/utils/pdfManager.ts.
      // All owned by T2b/T2d, not T0. See no-console above for the same
      // reasoning.
      '@typescript-eslint/consistent-type-imports': 0,
      '@typescript-eslint/no-dynamic-delete': 0,
      '@typescript-eslint/no-invalid-void-type': 0,
      '@typescript-eslint/no-namespace': 0,
      '@typescript-eslint/no-non-null-assertion': 0,
      // T0 (2026-08-17): disabled repo-wide — inherited from
      // tsEslint.configs.strict as an error; ~9 pre-existing `any` uses in
      // src/hooks/**, src/services/logger.ts, notionAPI.ts, telegramAPI.ts.
      // Owned by T2b/T2d, not T0.
      '@typescript-eslint/no-explicit-any': 0,
      // T0 (2026-08-17): disabled repo-wide — inherited from
      // tsEslint.configs.strict as an error; 9 pre-existing require() calls
      // in src/screens/MainScreen, src/screens/Programs (dynamic image
      // requires) and src/store/index.ts (conditional redux-logger require).
      // Owned by T2d/T2e, not T0.
      '@typescript-eslint/no-require-imports': 0,
      '@typescript-eslint/no-this-alias': 0,
      '@typescript-eslint/no-unused-vars': 0,
      '@typescript-eslint/no-var-requires': 0,
      'import/no-unresolved': 0, // handled by TypeScript
      'react/prop-types': 0,
    },
  },
  {
    // T0 (2026-08-17): narrowly-scoped overrides for single-file, mostly
    // single-instance violations found when ESLint was unblocked from a
    // hard crash (eslint@8 + eslint-plugin-unicorn@61 incompatibility — see
    // docs/tasks/T0-hygiene.md). Each of these files is owned by a later
    // brief (T1d/T2d/T2e/T2f/T3a per docs/tasks/README.md), so the rule
    // stays enforced everywhere else instead of a blanket repo-wide
    // disable. Remove an entry once the owning brief cleans up that file.
    files: ['src/components/organisms/VideoModal/index.tsx'],
    rules: { curly: 0 }, // missing braces around one `if` — T3a (FocusPlayer) owns this dir
  },
  {
    files: ['src/navigation/BottomTabNavigation.tsx'],
    rules: { 'object-shorthand': 0 }, // T1d
  },
  {
    files: ['src/screens/LibraryScreen/index.tsx'],
    rules: {
      'react-hooks/exhaustive-deps': 0, // missing `documentService` dep — T2f, needs a real look, not an autofix
      'unicorn/consistent-function-scoping': 0,
    },
  },
  {
    files: ['src/screens/Startup/index.tsx'],
    rules: { 'react-hooks/exhaustive-deps': 0 }, // missing auth/navigation deps — T2e, needs a real look, not an autofix
  },
  {
    files: ['src/services/telegramAPI.ts'],
    // unicorn/prefer-ternary is the exact rule that crash-looped ESLint 8
    // (docs/tasks/T0-hygiene.md revision block). The crash is fixed by the
    // eslint@9 bump; this only turns off the underlying stylistic finding
    // for this one file, owned by T2d.
    rules: { 'unicorn/better-regex': 0, 'unicorn/prefer-ternary': 0 },
  },
  {
    files: ['src/hooks/usePDFDocument.ts'],
    rules: { 'unicorn/catch-error-name': 0 }, // T2d
  },
  {
    files: ['src/services/API.ts', 'src/types/navigation.ts'],
    rules: { '@typescript-eslint/no-empty-object-type': 0 }, // src/types/navigation.ts is T1d's; API.ts's own `{}` return type is untouched pre-existing code, out of C4's narrow scope
  },
  {
    files: ['./**/*.test.{ts,tsx}'],
    plugins: {
      'testing-library': testingLibrary,
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-unsafe-call': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
      '@typescript-eslint/no-unsafe-return': 0,
    },
  },
  {
    // Both are CJS Jest/Metro tooling config, not application code — same
    // treatment as the pre-existing metro.config.js exclusion.
    ignores: ['metro.config.js', 'jest/resolver.js'],
  },
];
