import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle, init } from '@sentry/sveltekit';

init({
	dsn: 'https://97135dd542d05c29ae05f37d7a100db8@o390090.ingest.us.sentry.io/4508716359942144',

	tracesSampleRate: 1.0

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});

// export const userLanguageHandle: import('@sveltejs/kit').Handle = async ({event, resolve}) => {
// 	if (event.cookies.get(LANGUAGE_KEY)) return await resolve(event);

// 	let lang = event.request.headers.get('accept-language')?.split(',')[0] || LanguageCodeEnum.En;
// 	lang = lang.toUpperCase();
// 	event.cookies.set(LANGUAGE_KEY, lang, {...cookieOpts, expires: new Date(3000, 0, 1)});

// 	return await resolve(event);
// }

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle());

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
