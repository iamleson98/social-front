import type { Query } from '$lib/gql/graphql';
import { USER_ME_QUERY_STORE } from '$lib/stores/api';
import {
	ACCESS_TOKEN_KEY,
	HTTPStatusTemporaryRedirect,
} from '$lib/utils/consts.js';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { AppRoute } from '$lib/utils';
import { performBackendOperation } from '$lib/client';
import { tServer } from '$lib/i18n';


export const load: PageServerLoad = async (event) => {
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);

	if (accessToken) {
		const result = await performBackendOperation<Pick<Query, 'me'>>(
			'query',
			USER_ME_QUERY_STORE,
			{},
			event,
			{ requestPolicy: 'network-only' },
		);
		if (!result.error) {
			redirect(HTTPStatusTemporaryRedirect, AppRoute.HOME);
		}
	}

	return {
		meta: {
			title: tServer(event, 'signin.title'),
		},
	};
};
