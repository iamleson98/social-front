import {
	cacheExchange,
	Client,
	CombinedError,
	createRequest,
	fetchExchange,
	type AnyVariables,
	type DocumentInput,
	type Operation,
	type OperationContext,
	type OperationResult,
	type OperationType,
} from '@urql/core';
import { AppRoute, getCookieByKey } from './utils';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, HTTPStatusTemporaryRedirect, REFRESH_TOKEN_KEY } from './utils/consts';
import { authExchange, type AuthUtilities } from '@urql/exchange-auth';
import { USER_ME_QUERY_STORE, USER_REFRESH_TOKEN_MUTATION_STORE } from './stores/api';
import type { Mutation, Query, User } from './gql/graphql';
import { userStore } from './stores/auth';
import type { CookieSerializeOptions } from 'cookie';
import { goto } from '$app/navigation';
import { retryExchange } from '@urql/exchange-retry';
import { clientSideDeleteCookie, clientSideSetCookie } from './utils/cookies';
import { get, writable } from 'svelte/store';


export const MAX_REFRESH_TOKEN_TRIES = 3;
export const cookieOpts: Readonly<CookieSerializeOptions & { path: string }> = Object.freeze({
	path: '/',
	secure: true,
	maxAge: 24 * 60 * 60,
	httpOnly: false, // TODO: find a way to make it work
});

/**
 * @NOTE In Sitename, unauthorized errors usually have form like this:
 * @example
 * [
		{
			"message": "To access this path, you need one of the following permissions: MANAGE_PRODUCTS, MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES",
			"locations": [
				{
					"line": 8,
					"column": 9
				}
			],
			"path": [
				"attributes",
				"edges",
				0,
				"node",
				"valueRequired"
			],
			"extensions": {
				"exception": {
					"code": "PermissionDenied"
				}
			}
		}
	],
 */
const isAuthorError = (err: CombinedError): boolean => {
	for (const gqlErr of err.graphQLErrors) {
		if (gqlErr.message.toLowerCase().includes('to access this path, you need')) {
			return true;
		}

		if (Object.prototype.hasOwnProperty.call(gqlErr.extensions, 'exception')) {
			const exception = gqlErr.extensions.exception as Record<string, unknown>;
			if (Object.prototype.hasOwnProperty.call(exception, 'code')) {
				const code = exception.code;
				if (typeof code === 'string' && code.toLowerCase() === 'permissiondenied') {
					return true;
				}
			}
			return false;
		}
	}

	return false;
}

/**
 * @NOTE In Sitename, authentication errors usually have form like this:
 * @example
 * [
		{
			"message": "Signature has expired",
			"locations": [
				{
					"line": 2,
					"column": 3
				}
			],
			"path": [
				"attributes"
			],
			"extensions": {
				"exception": {
					"code": "ExpiredSignatureError"
				}
			}
		}
	],
 */
const isAuthenError = (err: CombinedError): boolean => {
	// some APIimmediately show that you don't have permission to access the resource
	// Actually that is because you are not authenticated
	if (isAuthorError(err)) {
		return true;
	}

	for (const gqlErr of err.graphQLErrors) {
		if (gqlErr.message.toLowerCase().includes('signature has expired')) {
			return true;
		}

		if (Object.prototype.hasOwnProperty.call(gqlErr.extensions, 'exception')) {
			const exception = gqlErr.extensions.exception as Record<string, unknown>;
			if (Object.prototype.hasOwnProperty.call(exception, 'code')) {
				const code = exception.code;
				if (typeof code === 'string' && code.toLowerCase() === 'expiredsignatureerror') {
					return true;
				}
			}
			return false;
		}
	}

	return false;
}

const authExchangeInner = async (utils: AuthUtilities) => {
	const refreshTracker = writable(false);

	const addAuthToOperation = (operation: Operation) => {
		const accessToken = getCookieByKey(ACCESS_TOKEN_KEY);
		if (accessToken) {
			return utils.appendHeaders(operation, {
				Authorization: `Bearer ${accessToken}`,
			});
		}

		return operation;
	}

	const refreshAuth = async () => {
		// prevent multiple refreshAuth calls
		if (get(refreshTracker)) return;

		// mark that we are refreshing
		refreshTracker.set(true);

		clientSideDeleteCookie(ACCESS_TOKEN_KEY);
		const csrfToken = getCookieByKey(CSRF_TOKEN_KEY);
		const refreshToken = getCookieByKey(REFRESH_TOKEN_KEY);

		if (!csrfToken || !refreshToken) {
			await goto(AppRoute.AUTH_SIGNIN, { invalidateAll: true });
		}

		const result = await utils
			.mutate<Pick<Mutation, 'tokenRefresh'>>(
				USER_REFRESH_TOKEN_MUTATION_STORE,
				{ csrfToken, refreshToken },
				{ requestPolicy: 'network-only' },
			);

		if (result.error || result.data?.tokenRefresh?.errors.length) {
			clientSideDeleteCookie(CSRF_TOKEN_KEY);
			clientSideDeleteCookie(REFRESH_TOKEN_KEY);
			await goto(AppRoute.AUTH_SIGNIN, { invalidateAll: true });
		};

		if (!result.data?.tokenRefresh) {
			clientSideSetCookie(ACCESS_TOKEN_KEY, result.data?.tokenRefresh?.token as string, { path: '/', secure: true, maxAge: 24 * 60 * 60 });
			userStore.set(result.data?.tokenRefresh?.user);
		}

		// mark that we have finished refreshing
		refreshTracker.set(false);
	}

	return {
		addAuthToOperation,
		refreshAuth,
		didAuthError: (error: CombinedError) => (isAuthenError(error) || isAuthorError(error)),
	};
}

/**
 * graphqlClient is similar to 'Client' of urql but with additional methods for server-side.
 */
export const graphqlClient = new Client({
	url: import.meta.env.VITE_GRAPHQL_API_END_POINT,
	exchanges: [
		// this auth exchange can run on slient side only
		authExchange(authExchangeInner),
		cacheExchange,
		retryExchange({
			initialDelayMs: 1000,
			maxDelayMs: 10000,
			randomDelay: true,
			maxNumberAttempts: 2,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			retryIf: (error: CombinedError, _: Operation): boolean => (browser && error && !!error.networkError),
		}),
		fetchExchange,
	],
});

/**
	 * @param result 
	 * @param event 
	 * @returns `true` means callers MUST run the operation again, `false` otherwise.
	 */
const checkIsAuthenAuthorErrorAndRedirectIfNeeded = async <Data = never, Variables extends AnyVariables = AnyVariables>(
	result: OperationResult<Data, Variables>,
	event: RequestEvent<Partial<Record<string, string>>, string | null>,
): Promise<boolean> => {
	const { error } = result;

	if (!error || !(isAuthenError(error) || isAuthorError(error))) {
		return false;
	}

	// If we reach here, it means we have an authen or author error
	event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/', maxAge: 0, secure: true });

	const csrfToken = event.cookies.get(CSRF_TOKEN_KEY) || '';
	const refreshToken = event.cookies.get(REFRESH_TOKEN_KEY) || '';

	if (!csrfToken || !refreshToken) {
		redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
	}

	const refreshTokenResult = await graphqlClient
		.mutation<Pick<Mutation, 'tokenRefresh'>>(
			USER_REFRESH_TOKEN_MUTATION_STORE,
			{ csrfToken, refreshToken, },
			{ requestPolicy: 'network-only' }
		)
		.toPromise();

	if (refreshTokenResult.error || refreshTokenResult.data?.tokenRefresh?.errors.length) {
		event.cookies.delete(CSRF_TOKEN_KEY, { path: '/', maxAge: 0 });
		event.cookies.delete(REFRESH_TOKEN_KEY, { path: '/', maxAge: 0 });
		redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
	};

	// set new access token to cookie (NO HTTPONLY)
	event.cookies.set(ACCESS_TOKEN_KEY, refreshTokenResult.data?.tokenRefresh?.token as string, cookieOpts);
	return true;
};

/**
 * This method is used for server-side only
 */
export const performBackendOperation = async <Data = never, Variables extends AnyVariables = AnyVariables>(
	type: OperationType,
	query: DocumentInput<Data, Variables>,
	variables: Variables,
	event: RequestEvent<Partial<Record<string, string>>, string | null>,
	context?: Partial<OperationContext>
): Promise<OperationResult<Data, Variables>> => {
	const newContext = attachAuthorizationHeaderToRequestIfNeeded(event, context);
	const request = createRequest(query, variables);
	const operation = graphqlClient.createRequestOperation(type, request, newContext);
	const result = await graphqlClient.executeRequestOperation(operation).toPromise();
	const mustRetryOperation = await checkIsAuthenAuthorErrorAndRedirectIfNeeded(result, event);
	if (!mustRetryOperation) return result;

	operation.context = {
		...operation.context,
		...attachAuthorizationHeaderToRequestIfNeeded(event, context),
	};
	return graphqlClient.executeRequestOperation(operation).toPromise();
};

/**
 * @note This function MUST be used in server load only
 * @param event 
 * @returns 
 */
export const pageRequiresAuthentication = async (event: RequestEvent<Partial<Record<string, string>>, string | null>) => {
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
	if (!accessToken) {
		redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
	}

	const meQueryResult = await performBackendOperation<Pick<Query, 'me'>>('query', USER_ME_QUERY_STORE, {}, event);
	return meQueryResult.data?.me as User;
};

const attachAuthorizationHeaderToRequestIfNeeded = (
	event: RequestEvent<Partial<Record<string, string>>, string | null>,
	context?: Partial<OperationContext>,
) => {
	const newContext = context || {};
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY) || '';

	if (accessToken) {
		newContext.fetchOptions = {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		};
	}

	return newContext;
};


