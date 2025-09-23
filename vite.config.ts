// import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		// sentrySvelteKit({
		// 	sourceMapsUploadOptions: {
		// 		org: 'sitename',
		// 		project: 'javascript-sveltekit'
		// 	}
		// }),
		sveltekit(),
		tailwindcss(),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
	assetsInclude: ['**/*.graphql'],
	server: {
		port: 5173,
		fs: {
			strict: false,
		},
	},
});
