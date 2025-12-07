import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { analyzer } from 'vite-bundle-analyzer'


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
		rollupOptions: {
			output: {
				manualChunks: id => {
					if (id.includes('node_modules')) {
						return 'vendor';  // Chunk all deps into one file for better caching
					}
				},
			},
		},
	},
});
