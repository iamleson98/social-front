import adapter from '@sveltejs/adapter-auto';
// import adapter from '@sveltejs/adapter-node';
// import adapter from '@sveltejs/adapter-vercel';
// import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess({ script: true }),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter({
			// out: "./.svelte-kit/output",
			// assets: true,
			// envPrefix: "MY_CUSTOM_",
			// development: true,
			// precompress: true,
			precompress: {
				brotli: true,
				// gzip: true,
				files: ["htm", "html"],
			},
			// dynamic_origin: true,
			// xff_depth: 1,
		}),
		alias: {
			$i18n: 'src/lib/i18n',
		},
		prerender: {
			concurrency: 5,
			handleHttpError: 'ignore', // for not showing error when building
		},
	},
	compilerOptions: {
		runes: true,
		sourcemap: false
	},
};

export default config;
