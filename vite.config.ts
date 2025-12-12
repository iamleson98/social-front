import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { analyzer } from 'vite-bundle-analyzer'
import type { UserConfig } from 'vite';


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
			sourcemap: mode === 'development',
			rollupOptions: {
				output: {
					manualChunks: (id) => {
						if (id.includes('node_modules')) {
							return 'vendor';  // Chunk all deps into one file for better caching
						}
					},
					// sourcemap: true,
				},
			},
		},
	} as UserConfig;
});
