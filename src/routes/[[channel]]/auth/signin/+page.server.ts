import { USER_ME_QUERY_STORE } from '$lib/api';
import { performServerSideGraphqlRequest } from '$lib/api/client';
import type { Query } from '$lib/gql/graphql';
import { serverSideTranslate } from '$lib/i18n';
import { AppRoute } from '$lib/utils';
import { ACCESS_TOKEN_KEY, HTTPStatusPermanentRedirect } from '$lib/utils/consts.js';
import { redirect } from '@sveltejs/kit';

export const load = async (event) => {
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);

	if (accessToken && accessToken !== 'undefined') {
		const result = await performServerSideGraphqlRequest<Pick<Query, 'me'>>(
			USER_ME_QUERY_STORE,
			{},
			event,
			{ requestPolicy: 'network-only' },
		);
		if (!result.error) {
			const next = event.url.searchParams.get('next');
			throw redirect(
				HTTPStatusPermanentRedirect,
				next ? decodeURIComponent(next) : AppRoute.HOME(),
			);
		}
	}

	return {
		meta: {
			title: await serverSideTranslate(event, 'signin.title'),
		},
	};
};
