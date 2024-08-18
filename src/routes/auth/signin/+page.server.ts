import type { Mutation, Query } from '$lib/gql/graphql';
import { USER_LOGIN_MUTATION_STORE, USER_ME_QUERY_STORE } from '$lib/stores/api';
import {
	ACCESS_TOKEN_KEY,
	CSRF_TOKEN_KEY,
	HTTPStatusBadRequest,
	HTTPStatusPermanentRedirect,
	HTTPStatusServerError,
	HTTPStatusTemporaryRedirect,
	REFRESH_TOKEN_KEY
} from '$lib/utils/consts.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppRoute } from '$lib/utils';
import { cookieOpts, graphqlClient } from '$lib/client';
import { tServer } from '$lib/i18n';


export const load: PageServerLoad = async (event) => {
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);

	if (accessToken) {
		const result = await graphqlClient.backendQuery<Pick<Query, 'me'>>(
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
		}
	};
};

export const actions = {
	signin: async (event) => {
		const credentials = await event.request.formData();
		const email = (credentials.get('email') as string) || '';
		const password = (credentials.get('password') as string) || '';
		const _rm = credentials.get('remember-me');

		if (!email.trim() || !password) {
			return fail(HTTPStatusBadRequest, { error: 'Please, provide valid email and password' });
		}

		const result = await graphqlClient.backendMutation<Pick<Mutation, 'tokenCreate'>>(
			USER_LOGIN_MUTATION_STORE,
			{ email, password },
			event,
			{ requestPolicy: 'network-only' }
		);

		if (result.error) {
			return fail(HTTPStatusServerError, { error: result.error.message });
		}

		if (result.data?.tokenCreate?.errors.length) {
			return fail(HTTPStatusBadRequest, { error: result.data.tokenCreate.errors[0].message as string });
		}

		event.cookies.set(ACCESS_TOKEN_KEY, result.data?.tokenCreate?.token as string, cookieOpts);
		event.cookies.set(CSRF_TOKEN_KEY, result.data?.tokenCreate?.csrfToken as string, cookieOpts);
		event.cookies.set(REFRESH_TOKEN_KEY, result.data?.tokenCreate?.refreshToken as string, cookieOpts);

		redirect(HTTPStatusPermanentRedirect, AppRoute.HOME);
	}
} satisfies Actions;
