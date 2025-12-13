import autoAdapter from '@sveltejs/adapter-auto';
import nodeAdapter from '@sveltejs/adapter-node';
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
		adapter: (process.env.RUNTIME === 'node' ? nodeAdapter : autoAdapter)({
			// out: "./.svelte-kit/output",
			// assets: true,
			// envPrefix: "MY_CUSTOM_",
			// development: true,
			// precompress: true,
			precompress: {
				brotli: true,
				gzip: true,
				files: ['html', 'htm', 'js', 'css', 'json', 'svg', 'png', 'jpg', 'woff', 'woff2'],
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
		experimental: {
			remoteFunctions: true,
		},
	},
	compilerOptions: {
		runes: true,
		sourcemap: false,
		warningFilter: (w) => {
			// this disable warnings for state reference locally warning
			return !['state_referenced_locally', 'css_unused_selector'].includes(w.code);
		},
		// NOTE: Please do not turn this async feature on. It will cause issues with links auto navigation when hover.

		// experimental: {
		// 	async: true,
		// },
	},
};

export default config;
