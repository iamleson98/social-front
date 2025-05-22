import type { Query } from '$lib/gql/graphql';
import {
	ACCESS_TOKEN_KEY,
	HTTPStatusPermanentRedirect,
} from '$lib/utils/consts.js';
import { redirect } from '@sveltejs/kit';
import { AppRoute } from '$lib/utils';
import { performServerSideGraphqlRequest } from '$lib/api/client';
import { serverSideTranslate } from '$lib/i18n';
import { USER_ME_QUERY_STORE } from '$lib/api';


export const load = async (event) => {
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);

	if (accessToken && accessToken !== 'undefined') {
		const result = await performServerSideGraphqlRequest<Pick<Query, 'me'>>(
			'query',
			USER_ME_QUERY_STORE,
			{},
			event,
			{ requestPolicy: 'network-only' },
		);
		if (!result.error) {
			const next = event.url.searchParams.get('next');
			throw redirect(HTTPStatusPermanentRedirect, next ? decodeURIComponent(next) : AppRoute.HOME());
		}
	}

	return {
		meta: {
			title: await serverSideTranslate(event, 'signin.title'),
		},
	};
};
