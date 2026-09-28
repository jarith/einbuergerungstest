import { defineConfig } from 'oxlint'

const reactImports = {
  paths: [
    {
      name: 'react',
      importNames: ['default'],
      allowTypeImports: true,
      message: 'Use named React imports; hooks are not allowed.',
    },
  ],
  patterns: [
    {
      regex: '.*',
      importNamePattern: '^use($|[A-Z0-9])',
      allowTypeImports: true,
      message: 'React hooks are not allowed.',
    },
  ],
}

export default defineConfig({
  plugins: ['eslint', 'typescript', 'react', 'jsx-a11y', 'vitest', 'import', 'promise'],
  jsPlugins: [
    {
      name: '@stylistic',
      specifier: '@stylistic/eslint-plugin',
    },
    './packages/lint-rules/src/plugin.ts',
    {
      name: '@pandacss',
      specifier: './packages/lint-rules/src/panda-plugin.ts',
    },
    'eslint-plugin-storybook',
  ],
  options: {
    typeAware: true,
    denyWarnings: true,
  },
  categories: {
    correctness: 'error',
    suspicious: 'error',
  },
  rules: {
    curly: 'error',
    'eslint/no-restricted-imports': ['error', reactImports],
    '@stylistic/padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: [
          {
            selector: 'VariableDeclaration',
            lineMode: 'multiline',
          },
          {
            selector: 'TSTypeAliasDeclaration',
            lineMode: 'multiline',
          },
          {
            selector: 'TSInterfaceDeclaration',
            lineMode: 'multiline',
          },
          {
            selector: 'ExpressionStatement',
            lineMode: 'multiline',
          },
        ],
      },
      {
        blankLine: 'always',
        prev: [
          {
            selector: 'VariableDeclaration',
            lineMode: 'multiline',
          },
          {
            selector: 'TSTypeAliasDeclaration',
            lineMode: 'multiline',
          },
          {
            selector: 'TSInterfaceDeclaration',
            lineMode: 'multiline',
          },
          {
            selector: 'ExpressionStatement',
            lineMode: 'multiline',
          },
        ],
        next: '*',
      },
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var'],
        next: ['type', 'interface'],
      },
      {
        blankLine: 'always',
        prev: ['type', 'interface'],
        next: ['const', 'let', 'var'],
      },
      {
        blankLine: 'always',
        prev: 'type',
        next: 'interface',
      },
      {
        blankLine: 'always',
        prev: 'interface',
        next: 'type',
      },
      {
        blankLine: 'always',
        prev: {
          selector:
            'Program > :matches(ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, VariableDeclaration, FunctionDeclaration, ClassDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration, TSEnumDeclaration, TSModuleDeclaration, TSDeclareFunction)',
        },
        next: {
          selector:
            'Program > :matches(ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, VariableDeclaration, FunctionDeclaration, ClassDeclaration, TSTypeAliasDeclaration, TSInterfaceDeclaration, TSEnumDeclaration, TSModuleDeclaration, TSDeclareFunction)',
        },
      },
      {
        blankLine: 'always',
        prev: '*',
        next: {
          selector:
            "ExpressionStatement:matches([expression.type='CallExpression'], [expression.type='AwaitExpression'][expression.argument.type='CallExpression']):not(:has(CallExpression[callee.type='Identifier'][callee.name='expect'])):not(:has(CallExpression[callee.type='Identifier'][callee.name='expectTypeOf']))",
        },
      },
      {
        blankLine: 'always',
        prev: {
          selector:
            "ExpressionStatement:matches([expression.type='CallExpression'], [expression.type='AwaitExpression'][expression.argument.type='CallExpression']):not(:has(CallExpression[callee.type='Identifier'][callee.name='expect'])):not(:has(CallExpression[callee.type='Identifier'][callee.name='expectTypeOf']))",
        },
        next: '*',
      },
      {
        blankLine: 'always',
        prev: {
          selector:
            "ExpressionStatement:matches(:has(CallExpression[callee.type='Identifier'][callee.name='expect']), :has(CallExpression[callee.type='Identifier'][callee.name='expectTypeOf']))",
        },
        next: '*',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: ['return', 'if', 'for'],
      },
      {
        blankLine: 'any',
        prev: {
          selector:
            "ExpressionStatement:matches(:has(CallExpression[callee.type='Identifier'][callee.name='expect']), :has(CallExpression[callee.type='Identifier'][callee.name='expectTypeOf']))",
        },
        next: {
          selector:
            "ExpressionStatement:matches(:has(CallExpression[callee.type='Identifier'][callee.name='expect']), :has(CallExpression[callee.type='Identifier'][callee.name='expectTypeOf']))",
        },
      },
      {
        blankLine: 'never',
        prev: {
          selector: 'Program > :matches(ExportAllDeclaration, ExportNamedDeclaration[source])',
        },
        next: {
          selector: 'Program > :matches(ExportAllDeclaration, ExportNamedDeclaration[source])',
        },
      },
      {
        blankLine: 'always',
        prev: {
          selector:
            "Program > :matches(ExportAllDeclaration[exportKind='type'], ExportNamedDeclaration[exportKind='type'][source])",
        },
        next: {
          selector:
            "Program > :matches(ExportAllDeclaration[exportKind='value'], ExportNamedDeclaration[exportKind='value'][source])",
        },
      },
      {
        blankLine: 'always',
        prev: {
          selector:
            "Program > :matches(ExportAllDeclaration[exportKind='value'], ExportNamedDeclaration[exportKind='value'][source])",
        },
        next: {
          selector:
            "Program > :matches(ExportAllDeclaration[exportKind='type'], ExportNamedDeclaration[exportKind='type'][source])",
        },
      },
      {
        blankLine: 'always',
        prev: '*',
        next: {
          selector:
            'Program > :matches(ExportNamedDeclaration[declaration], ExportDefaultDeclaration)',
        },
      },
    ],
    '@stylistic/no-multiple-empty-lines': [
      'error',
      {
        max: 1,
      },
    ],
    'typescript/no-explicit-any': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-return': 'error',
    'typescript/no-floating-promises': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/strict-boolean-expressions': 'error',
    'typescript/only-throw-error': 'error',
    'typescript/prefer-promise-reject-errors': 'error',
    'typescript/restrict-plus-operands': 'error',
    'typescript/no-deprecated': 'error',
    'typescript/switch-exhaustiveness-check': 'error',
    'typescript/consistent-type-imports': 'error',
    'react/no-unstable-nested-components': 'error',
    'react/jsx-key': 'error',
    'vitest/no-focused-tests': 'error',
    'vitest/no-disabled-tests': 'error',
    'import/no-cycle': 'error',
    'react/react-in-jsx-scope': 'off',
    'import/no-unassigned-import': [
      'error',
      {
        allow: ['**/*.css', '@total-typescript/ts-reset'],
      },
    ],
    'app/no-array-filter-map': 'error',
    'app/no-chained-type-assertions': 'error',
    'app/no-known-value-widening': 'error',
    'app/no-module-mocking': 'error',
    'app/no-object-parameters': 'error',
    'app/no-reduce-accumulator-copy': 'error',
    'app/no-reflect-apply': 'error',
    'app/no-reflect-get': 'error',
    'app/no-runtime-typeof': 'error',
    'app/no-shape-in-symbol-names': 'error',
    'app/no-unknown-parameters': 'error',
    'app/no-unknown-returns': 'error',
    'app/no-unknown-type-aliases': 'error',
    'app/no-unsafe-dictionary-type': 'error',
    'app/require-safety-comment-for-type-assertion': 'error',
    'app/no-atom-in-props': 'error',
    'app/no-hardcoded-design-literals': 'error',
    'app/component-folder-structure': 'error',
    'app/no-conditional-jsx-return': 'error',
    'app/no-inline-types': 'error',
    'app/no-reexport-outside-index': 'warn',
    'app/prefer-array-methods': 'warn',
    'app/require-action-for-set': 'error',
    '@pandacss/file-not-included': 'off',
    '@pandacss/no-debug': 'error',
    '@pandacss/no-deprecated': 'error',
    '@pandacss/extraction-diagnostics': 'error',
    '@pandacss/prefer-token': ['error', { categories: ['colors'] }],
    '@pandacss/no-important': 'error',
    '@pandacss/no-invalid-token-paths': 'error',
    '@pandacss/no-invalid-nesting': 'error',
    '@pandacss/no-margin-properties': 'error',
    '@pandacss/no-physical-properties': 'error',
    '@pandacss/no-shorthand-longhand-mix': 'error',
    '@pandacss/consistent-property-style': ['error', { style: 'longhand' }],
    'no-else-return': 'error',
    'typescript/prefer-as-const': 'error',
  },
  ignorePatterns: [
    '**/node_modules/**',
    '.yarn/**',
    '**/styled-system/**',
    '**/.features-gen/**',
    '**/storybook-static/**',
    '**/dist/**',
    '**/test-results/**',
    '**/playwright-report/**',
  ],
  overrides: [
    {
      files: ['.smithers/**'],
      rules: {
        'eslint/no-restricted-imports': 'off',
        'eslint/no-underscore-dangle': 'off',
        'app/no-runtime-typeof': 'off',
        'app/no-unknown-parameters': 'off',
        'app/prefer-array-methods': 'off',
      },
    },
    {
      files: ['packages/create-package-cli/src/generator.ts'],
      rules: {
        'app/no-runtime-typeof': [
          'error',
          {
            allowInTypeGuards: true,
          },
        ],
      },
    },
    {
      files: [
        'packages/lint-rules/src/no-hardcoded-design-literals/rule.ts',
        'packages/lint-rules/src/test-utils/run-oxlint.ts',
      ],
      rules: {
        'app/no-runtime-typeof': 'off',
      },
    },
    {
      files: ['packages/design-system/src/index.ts', 'packages/design-system/src/jsx/index.ts'],
      rules: {
        'app/no-reexport-outside-index': 'off',
      },
    },
    {
      files: ['**/*.stories.tsx'],
      rules: {
        'app/component-folder-structure': 'off',
        'app/no-hardcoded-design-literals': 'off',
      },
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/test-setup.ts'],
      rules: {
        'app/no-hardcoded-design-literals': 'off',
        'app/require-action-for-set': 'off',
        'app/prefer-array-methods': 'off',
      },
    },
    {
      files: ['**/tokens/**/*.ts', '**/panda-tokens.ts', '**/panda-tokens.test.ts'],
      rules: {
        'app/no-hardcoded-design-literals': 'off',
      },
    },
    {
      files: ['e2e/**'],
      rules: {
        'app/no-inline-types': 'off',
      },
    },
    {
      files: ['**/styling.ts', '**/styling/index.ts'],
      rules: {
        'app/no-reexport-outside-index': 'off',
      },
    },
    {
      files: ['**/src/tests/*.test.ts'],
      rules: {
        'app/component-folder-structure': 'off',
      },
    },
    {
      files: ['**/packages/server/src/**/*.ts'],
      rules: {
        'app/no-atom-in-props': 'off',
        'app/no-hardcoded-design-literals': 'off',
        'app/component-folder-structure': 'off',
        'app/no-conditional-jsx-return': 'off',
        'app/require-action-for-set': 'off',
      },
    },
    {
      files: ['web/**/*', 'e2e/**/*', 'packages/**/*'],
      excludeFiles: ['packages/design-system/**/*'],
      rules: {
        'eslint/no-restricted-imports': [
          'error',
          {
            paths: reactImports.paths,
            patterns: [
              ...reactImports.patterns,
              {
                group: [
                  '**/styled-system',
                  '**/styled-system/**',
                  '**/design-system/src/**',
                  '@einbuergerungstest/design-system/*',
                  '!@einbuergerungstest/design-system/styles.css',
                  '!@einbuergerungstest/design-system/jsx',
                ],
                message:
                  'Import styling APIs through @einbuergerungstest/design-system; generated modules are private to the design system.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['web/**/*', 'e2e/**/*', 'packages/**/*'],
      excludeFiles: ['packages/design-system/**/*', '**/*.recipe.ts'],
      rules: {
        'eslint/no-restricted-imports': [
          'error',
          {
            paths: reactImports.paths,
            patterns: [
              ...reactImports.patterns,
              {
                group: [
                  '**/styled-system',
                  '**/styled-system/**',
                  '**/design-system/src/**',
                  '@einbuergerungstest/design-system/*',
                  '!@einbuergerungstest/design-system/styles.css',
                  '!@einbuergerungstest/design-system/jsx',
                ],
                message:
                  'Import styling APIs through @einbuergerungstest/design-system; generated modules are private to the design system.',
              },
              {
                group: [
                  '@einbuergerungstest/design-system',
                  '@pandacss/dev',
                  '**/styled-system/css',
                ],
                importNames: ['cva', 'sva', 'defineRecipe', 'defineSlotRecipe'],
                message:
                  'Define recipes in colocated .recipe.ts files; consumers import the recipe rather than its factory.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['packages/design-system/**/*'],
      excludeFiles: [
        '**/*.recipe.ts',
        '**/panda.config.ts',
        'packages/design-system/src/index.ts',
        'packages/design-system/src/foundation/panda/**/*',
      ],
      rules: {
        'eslint/no-restricted-imports': [
          'error',
          {
            paths: reactImports.paths,
            patterns: [
              ...reactImports.patterns,
              {
                group: [
                  '@einbuergerungstest/design-system',
                  '@pandacss/dev',
                  '**/styled-system/css',
                ],
                importNames: ['cva', 'sva', 'defineRecipe', 'defineSlotRecipe'],
                message:
                  'Define recipes in colocated .recipe.ts files; consumers import the recipe rather than its factory.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['**/*.stories.ts', '**/*.stories.tsx'],
      rules: {
        'storybook/meta-satisfies-type': 'error',
        'storybook/csf-component': 'error',
        'storybook/story-exports': 'error',
        'storybook/await-interactions': 'error',
        'storybook/context-in-play-function': 'error',
      },
    },
  ],
})
