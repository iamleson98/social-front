import { cookieOpts } from '$lib/api/client.js';
import { AppRoute } from '$lib/utils';
import { CHANNELS, DEFAULT_CHANNEL } from '$lib/utils/consts';
import { CHANNEL_KEY, HTTPStatusSeeOther } from '$lib/utils/consts';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params, cookies }) => {
	// NOTE: mutating `params` is an undocumented hack that does not reliably
	// propagate to parallel loaders — only read it here and redirect unknown
	// channels to the default one instead of rewriting the value in place.
	const channel = params.channel ?? DEFAULT_CHANNEL.slug;
	if (!CHANNELS.some((chan) => chan.slug === channel)) {
		// 303 (See Other): unknown/retired channel slugs must not be cached
		// permanently by browsers and proxies.
		redirect(HTTPStatusSeeOther, AppRoute.HOME());
	}

	cookies.set(CHANNEL_KEY, channel, { ...cookieOpts });

	return {
		meta: {
			title: 'Sitename',
			description: 'Sitename web interface',
		},
	};
};
