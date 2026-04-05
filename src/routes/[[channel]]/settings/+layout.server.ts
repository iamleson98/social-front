import { createUserFromUserProfile, type User } from '$lib/stores/auth/user.js';
import { BackendHttpClient } from '$lib/utils/api.js';
import { Authorization, HTTPStatusPermanentRedirect, MMAUTHTOKEN } from '$lib/utils/consts.js';
import { AppRoute } from '$lib/utils/routes.js';
import { redirect } from '@sveltejs/kit';

export const ssr = false;

export const load = async (event) => {
	const accessToken = event.cookies.get(MMAUTHTOKEN);

	BackendHttpClient.setHeader(Authorization, `Bearer ${accessToken}`);
	const user = await BackendHttpClient.getMe();

	if (accessToken) {
		return {
			meta: {
				title: 'Settings',
			},
			user: createUserFromUserProfile(user),
		};
	}

	throw redirect(
		HTTPStatusPermanentRedirect,
		`${AppRoute.AUTH_SIGNIN()}?next=${event.url.pathname}${event.url.search}`,
	);
};
