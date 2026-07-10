import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			sveltekit(),
			tailwindcss(),
			analyzer(),
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
		build: {
			minify: mode !== 'development',
		},
	};
});
