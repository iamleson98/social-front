import { serverSideTranslate } from '$lib/i18n';
import { AppRoute } from '$lib/utils';
import { HTTPStatusPermanentRedirect, MMAUTHTOKEN } from '$lib/utils/consts.js';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const accessToken = event.cookies.get(MMAUTHTOKEN);

	if (accessToken) {
		const next = event.url.searchParams.get('next');
		throw redirect(HTTPStatusPermanentRedirect, next ? decodeURIComponent(next) : AppRoute.HOME());
	}

	return {
		meta: {
			title: await serverSideTranslate(event, 'signin.title'),
		},
	};
};
