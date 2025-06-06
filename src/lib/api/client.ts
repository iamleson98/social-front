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
import { AppRoute, getCookieByKey } from '$lib/utils';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, HTTPStatusTemporaryRedirect, HTTPStatusUnauthorized, REFRESH_TOKEN_KEY } from '$lib/utils/consts';
import { authExchange, type AuthUtilities } from '@urql/exchange-auth';
import type { PermissionEnum, Query, User } from '$lib/gql/graphql';
import type { CookieSerializeOptions } from 'cookie';
import { retryExchange } from '@urql/exchange-retry';
import { PUBLIC_GRAPHQL_API_END_POINT } from '$env/static/public';
import { USER_ME_QUERY_STORE } from '.';
import { setUserStoreValue } from '$lib/stores/auth/user';
import { checkUserHasPermissions } from '$lib/utils/utils';

export const MAX_REFRESH_TOKEN_TRIES = 3;
export const cookieOpts: Readonly<CookieSerializeOptions & { path: string }> = Object.freeze({
	path: '/',
	secure: true,
	maxAge: 24 * 60 * 60,
	httpOnly: false,
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
				const code = exception.code as string;
				if (code.toLowerCase() === 'permissiondenied') {
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
				const code = exception.code as string;
				if (['expiredsignatureerror', 'invalidsignatureerror'].includes(code.toLowerCase())) {
					return true;
				}
			}
			return false;
		}
	}

	return false;
}

/** Guarding condition that designates if token refreshing is in progress, prevent request spam  */
let isTokenRefreshingInProgress = false

const authExchangeInner = async (utils: AuthUtilities) => {
	const addAuthToOperation = (operation: Operation) => {
		const accessToken = getCookieByKey(ACCESS_TOKEN_KEY);
		if (accessToken) {
			operation = utils.appendHeaders(operation, {
				Authorization: `Bearer ${accessToken}`,
			});
		}

		return operation;
	}

	const refreshAuth = async () => {
		if (isTokenRefreshingInProgress || !browser) return; // this code executes on client-side only
		isTokenRefreshingInProgress = true

		const refreshResult = await fetch(
			AppRoute.AUTH_REFRESH_TOKEN(),
			{
				method: 'POST',
				body: JSON.stringify({
					refreshToken: getCookieByKey(REFRESH_TOKEN_KEY),
					csrfToken: getCookieByKey(CSRF_TOKEN_KEY),
				}),
			}
		);

		const result: Record<string, unknown> = await refreshResult.json();
		setUserStoreValue(result.user as User);

		isTokenRefreshingInProgress = false;
	}

	return {
		addAuthToOperation,
		refreshAuth,
		didAuthError: (error: CombinedError) => (isAuthenError(error) || isAuthorError(error)),
	};
}

/**
 * GRAPHQL_CLIENT is similar to 'Client' of urql but with additional methods for server-side.
 */
export const GRAPHQL_CLIENT = new Client({
	url: PUBLIC_GRAPHQL_API_END_POINT,
	exchanges: [
		// this auth exchange can run on client side only
		authExchange(authExchangeInner),
		cacheExchange,
		retryExchange({
			initialDelayMs: 1000,
			maxDelayMs: 10000,
			randomDelay: true,
			maxNumberAttempts: 2,
			retryIf: (error): boolean => (error && !!error.networkError),
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

	await event.fetch(
		`${AppRoute.AUTH_REFRESH_TOKEN()}`,
		{
			method: 'POST',
			body: JSON.stringify({
				refreshToken: event.cookies.get(REFRESH_TOKEN_KEY),
				csrfToken: event.cookies.get(CSRF_TOKEN_KEY),
			}),
		}
	);

	return true;
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

/**
 * NOTE: This method is used for server-side only
 */
export const performServerSideGraphqlRequest = async <Data = never, Variables extends AnyVariables = AnyVariables>(
	type: OperationType,
	query: DocumentInput<Data, Variables>,
	variables: Variables,
	event: RequestEvent<Partial<Record<string, string>>, string | null>,
	context?: Partial<OperationContext>
): Promise<OperationResult<Data, Variables>> => {
	const newContext = attachAuthorizationHeaderToRequestIfNeeded(event, context);
	const request = createRequest(query, variables);
	const operation = GRAPHQL_CLIENT.createRequestOperation(type, request, newContext);
	const result = await GRAPHQL_CLIENT.executeRequestOperation(operation);
	const mustRetryOperation = await checkIsAuthenAuthorErrorAndRedirectIfNeeded(result, event);
	if (!mustRetryOperation) return result;

	operation.context = {
		...operation.context,
		...attachAuthorizationHeaderToRequestIfNeeded(event, context),
	};
	return GRAPHQL_CLIENT.executeRequestOperation(operation);
};

/**
 * @note This function MUST be used in server load only
 * @param event 
 * @returns 
 */
export const pageRequiresAuthentication = async (event: RequestEvent<Partial<Record<string, string>>, string | null>) => {
	const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
	if (!accessToken) {
		redirect(HTTPStatusTemporaryRedirect, `${AppRoute.AUTH_SIGNIN()}?next=${event.url.pathname}`);
	}

	const meQueryResult = await performServerSideGraphqlRequest<Pick<Query, 'me'>>('query', USER_ME_QUERY_STORE, {}, event, { requestPolicy: 'cache-and-network' });
	return meQueryResult.data?.me as User;
};

/**
 * @note This function MUST be used in server load only
 * @param event 
 * @returns 
 */
export const pageRequiresPermissions = async (event: RequestEvent<Partial<Record<string, string>>, string | null>, ...permissions: PermissionEnum[]) => {
	const authenticatedUser = await pageRequiresAuthentication(event);

	if (!authenticatedUser.userPermissions?.length) {
		return error(HTTPStatusUnauthorized, 'Unauthorized');
	}

	if (!checkUserHasPermissions(authenticatedUser, ...permissions))
		return error(HTTPStatusUnauthorized, 'Unauthorized');

	return authenticatedUser;
};
