import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle, init } from '@sentry/sveltekit';
// import type { Handle } from '@sveltejs/kit';

init({
	dsn: 'https://97135dd542d05c29ae05f37d7a100db8@o390090.ingest.us.sentry.io/4508716359942144',

	tracesSampleRate: 1.0

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});

// export const staticHandler: Handle = async ({ event, resolve }) => {
// 	if (event.url.pathname.endsWith('.css')) {
// 		console.log('lololol');
// 	}

// 	// console.log(event)

// 	return await resolve(event);
// }

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle());

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
