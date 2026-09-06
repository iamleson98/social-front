import { env as privateEnv } from '$env/dynamic/private';
import { USER_LOGIN_MUTATION_STORE, USER_REFRESH_TOKEN_MUTATION_STORE } from '$lib/api';
import { GRAPHQL_CLIENT } from '$lib/api/client';
import type { Mutation, MutationTokenCreateArgs, MutationTokenRefreshArgs } from '$lib/gql/graphql';
import { HTTPStatusForbidden, HTTPStatusTooManyRequests } from '$lib/utils/consts';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

let token: string | null = null;
let refreshToken: string | null | undefined = null;
let csrfToken: string | null | undefined = null;

export const getMiddleAccountAccessToken = async () => {
	const managerEmail = privateEnv.PROMOTION_MANAGER_EMAIL;
	const managerPwd = privateEnv.PROMOTION_MANAGER_PWD;

	// Service-account credentials are runtime config — when they are not
	// configured (e.g. CI/preview deploys) we bail out instead of attempting
	// an authenticated signin that can only fail.
	if (!managerEmail || !managerPwd) return null;

	if (!token) {
		const signinResult = await GRAPHQL_CLIENT.mutation<
			Pick<Mutation, 'tokenCreate'>,
			MutationTokenCreateArgs
		>(USER_LOGIN_MUTATION_STORE, {
			email: managerEmail,
			password: managerPwd,
		});
		if (signinResult.error || !signinResult.data?.tokenCreate?.token) return null;

		token = signinResult.data?.tokenCreate.token;
		refreshToken = signinResult.data?.tokenCreate.refreshToken;
		csrfToken = signinResult.data?.tokenCreate.csrfToken;
	}

	return token;
};

export const tryRefreshToken = async () => {
	if (!refreshToken || !csrfToken) {
		token = null;
		return await getMiddleAccountAccessToken();
	}

	const refreshResult = await GRAPHQL_CLIENT.mutation<
		Pick<Mutation, 'tokenRefresh'>,
		MutationTokenRefreshArgs
	>(USER_REFRESH_TOKEN_MUTATION_STORE, {
		refreshToken,
		csrfToken,
	});

	if (refreshResult.error || !refreshResult.data?.tokenRefresh?.token) return null;

	token = refreshResult.data?.tokenRefresh.token;

	return token;
};

/**
 * Guard for public-but-privileged server endpoints (e.g. /api/promotions that
 * internally uses a service account): only same-origin browser calls are
 * allowed, which prevents the endpoint from being abused as an open proxy.
 */
export const isSameOriginRequest = (event: RequestEvent): boolean => {
	const origin = event.request.headers.get('origin');
	if (origin) {
		try {
			return new URL(origin).host === event.url.host;
		} catch {
			return false;
		}
	}

	// same-origin GET/navigation requests may omit Origin — fall back to Referer
	const referer = event.request.headers.get('referer');
	if (referer) {
		try {
			return new URL(referer).host === event.url.host;
		} catch {
			return false;
		}
	}

	return false;
};

export const forbiddenJson = () =>
	json({ error: 'Forbidden', status: HTTPStatusForbidden }, { status: HTTPStatusForbidden });

export const tooManyRequestsJson = () =>
	json(
		{ error: 'Too many requests', status: HTTPStatusTooManyRequests },
		{ status: HTTPStatusTooManyRequests },
	);

/**
 * Minimal in-memory fixed-window rate limiter (per IP + route). Good enough to
 * stop trivial abuse of unauthenticated endpoints in a single-instance deploy;
 * swap for Redis in multi-instance setups.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (key: string, limit: number, windowMs: number): boolean => {
	const now = Date.now();
	const bucket = buckets.get(key);

	if (!bucket || now > bucket.resetAt) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return true;
	}

	bucket.count += 1;
	return bucket.count <= limit;
};
