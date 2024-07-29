import type { Mutation, Query } from '$lib/gql/graphql';
import { USER_LOGIN_MUTATION_STORE, USER_ME_QUERY_STORE } from '$lib/stores/api';
import {
	ACCESS_TOKEN_KEY,
	CSRF_TOKEN_KEY,
	HTTPStatusBadRequest,
	HTTPStatusServerError,
	HTTPStatusSuccess,
	HTTPStatusTemporaryRedirect
} from '$lib/utils/consts.js';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AppRoute } from '$lib/utils';
import { graphqlClient } from '$lib/client';
import { tServer } from '$lib/i18n';


export const load: PageServerLoad = async (event) => {
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
	const response: Record<string, unknown> = {
		meta: {
			title: tServer(event, 'signin.title'),
		}
	};

	if (accessToken) {
		const result = await graphqlClient.backendQuery<Pick<Query, 'me'>>(
			USER_ME_QUERY_STORE,
			{},
			event
		);
		if (result.error) {
			response.status = HTTPStatusServerError;
			response.error = result.error.message;
			return response;
		}

		redirect(HTTPStatusTemporaryRedirect, AppRoute.HOME);
	}

	response.status = HTTPStatusSuccess;
	return response;
};

export const actions = {
	signin: async (event) => {
		const credentials = await event.request.formData();
		const email = (credentials.get('email') as string) || '';
		const password = (credentials.get('password') as string) || '';

		if (!email.trim() || !password) {
			return {
				status: HTTPStatusBadRequest,
				error: 'Please, provide valid email and password'
			};
		}

		const result = await graphqlClient.backendMutation<Pick<Mutation, 'tokenCreate'>>(
			USER_LOGIN_MUTATION_STORE,
			{ email, password },
			event,
			{
				requestPolicy: 'network-only'
			}
		);
		if (result.error) {
			return {
				status: HTTPStatusServerError,
				error: result.error.message
			};
		}

		if (result.data?.tokenCreate?.errors.length) {
			return {
				status: HTTPStatusBadRequest,
				error: result.data.tokenCreate.errors[0].message
			};
		}

		const cookieOpts = {
			path: '/',
			secure: true,
			httpOnly: true,
			maxAge: 24 * 60 * 60
		};
		event.cookies.set(ACCESS_TOKEN_KEY, result.data?.tokenCreate?.token as string, cookieOpts);
		event.cookies.set(CSRF_TOKEN_KEY, result.data?.tokenCreate?.csrfToken as string, cookieOpts);

		return {
			user: result.data?.tokenCreate?.user
		};
	}
} satisfies Actions;
