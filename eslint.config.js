import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,

	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: ts.parser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				projectService: true,
				experimentalDecorators: true,
				emitDecoratorMetadata: true,
				ecmaFeatures: {
					legacyDecorators: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			'@typescript-eslint': ts.plugin,
		},
		rules: {
			// Add TypeScript-specific rules here
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	},

	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parser: ts.parser,
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				experimentalDecorators: true,
				ecmaFeatures: {
					legacyDecorators: true,
				},
				svelteConfig,
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			svelte,
		},
		rules: {
			'svelte/no-dupe-else-if-blocks': 'error',
			'svelte/no-dom-manipulating': 'error',
		},
		settings: {
			svelte: {
				ignoreWarnings: [
					'@typescript-eslint/no-unsafe-assignment',
					'@typescript-eslint/no-unsafe-member-access',
				],
			},
			kit: {
				files: {
					routes: 'src/routes',
				},
			},
		},
	}
);
