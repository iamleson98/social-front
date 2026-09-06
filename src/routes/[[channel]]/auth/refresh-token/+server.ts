import { USER_REFRESH_TOKEN_MUTATION_STORE } from '$lib/api';
import { authTokenCookieOpts, cookieOpts, GRAPHQL_CLIENT } from '$lib/api/client';
import type { Mutation, MutationTokenRefreshArgs } from '$lib/gql/graphql';
import {
	ACCESS_TOKEN_KEY,
	CSRF_TOKEN_KEY,
	HTTPStatusBadRequest,
	HTTPStatusUnauthorized,
	REFRESH_TOKEN_KEY,
} from '$lib/utils/consts';
import type { RequestEvent } from './$types';
import { json } from '@sveltejs/kit';

type Props = {
	refreshToken?: string;
	csrfToken?: string;
};

/**
 * This endpoint is consumed by the browser-side urql auth exchange via fetch,
 * so it responds with JSON instead of redirects. The refresh + CSRF tokens
 * are expected in the (httpOnly) cookies; the JSON body is accepted as a
 * fallback for callers that store them elsewhere.
 */
export const POST = async (event: RequestEvent) => {
	let body: Props = {};
	try {
		body = (await event.request.json()) as Props;
	} catch {
		// empty or malformed body — fall back to cookies below
	}

	const refreshToken = body.refreshToken || event.cookies.get(REFRESH_TOKEN_KEY);
	const csrfToken = body.csrfToken || event.cookies.get(CSRF_TOKEN_KEY);

	if (!refreshToken || !csrfToken) {
		event.cookies.delete(REFRESH_TOKEN_KEY, authTokenCookieOpts);
		event.cookies.delete(CSRF_TOKEN_KEY, authTokenCookieOpts);
		return json({ error: 'Missing refresh token', status: HTTPStatusBadRequest });
	}

	const result = await GRAPHQL_CLIENT.mutation<
		Pick<Mutation, 'tokenRefresh'>,
		MutationTokenRefreshArgs
	>(
		USER_REFRESH_TOKEN_MUTATION_STORE,
		{
			refreshToken,
			csrfToken,
		},
		{ requestPolicy: 'network-only' },
	);

	if (result.error || result.data?.tokenRefresh?.errors.length) {
		event.cookies.delete(ACCESS_TOKEN_KEY, cookieOpts);
		event.cookies.delete(REFRESH_TOKEN_KEY, authTokenCookieOpts);
		event.cookies.delete(CSRF_TOKEN_KEY, authTokenCookieOpts);

		return json(
			{
				error: result.error?.message || result.data?.tokenRefresh?.errors?.[0]?.message,
				status: HTTPStatusUnauthorized,
			},
			{ status: HTTPStatusUnauthorized },
		);
	}

	event.cookies.set(ACCESS_TOKEN_KEY, result.data?.tokenRefresh?.token as string, cookieOpts);
	event.cookies.set(REFRESH_TOKEN_KEY, refreshToken, authTokenCookieOpts);
	event.cookies.set(CSRF_TOKEN_KEY, csrfToken, authTokenCookieOpts);

	return json({
		user: result.data?.tokenRefresh?.user,
		[ACCESS_TOKEN_KEY]: result.data?.tokenRefresh?.token,
	});
};
