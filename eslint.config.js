import svelteConfig from './svelte.config.js';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import ts from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
        includeIgnoreFile(gitignorePath),
        js.configs.recommended,
        ...ts.configs.recommended,
        ...svelte.configs.recommended,
        prettier,
        ...svelte.configs.prettier,
        {
                languageOptions: {
                        globals: { ...globals.browser, ...globals.node },
                },
                rules: {
                        // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
                        // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
                        'no-undef': 'off',
                        'svelte/no-at-html-tags': 'error',
                        'svelte/no-dupe-else-if-blocks': 'error',
                        // the app routes through channel-aware helpers (buildLinkWithRespectToChannel)
                        // instead of SvelteKit resolve(), so this recommended rule does not apply here
                        'svelte/no-navigation-without-resolve': 'off',
                        'svelte/no-reactive-reassign': 'error',
                        'svelte/valid-compile': 'error',
                        curly: ['error', 'all'],
                        eqeqeq: ['error', 'always'],
                        'no-console': 'error',
                        'no-debugger': 'error',
                        'prefer-const': 'error',
                        'no-var': 'error',
                        'object-shorthand': ['error', 'always'],
                        'arrow-body-style': ['error', 'as-needed'],
                        'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
                        'max-params': ['warn', 4],
                        '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
                        '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'explicit' }],
                        '@typescript-eslint/no-explicit-any': 'error',
                        '@typescript-eslint/no-floating-promises': 'error',
                        '@typescript-eslint/no-misused-promises': 'error',
                        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
                        '@typescript-eslint/prefer-readonly': 'error',
                        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
                        '@typescript-eslint/consistent-type-imports': 'error',
                        '@typescript-eslint/no-unused-vars': [
                                'error',
                                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
                        ],
                        // the base rule is disabled in favor of @typescript-eslint/no-unused-vars
                        // (the base rule reports false positives on TS enums / interfaces)
                        'no-unused-vars': 'off',
                },
        },
        {
                files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js', '**/*.ts'],
                languageOptions: {
                        parserOptions: {
                                projectService: true,
                                extraFileExtensions: ['.svelte'],
                                parser: ts.parser,
                                svelteConfig,
                        },
                },
        },
);
