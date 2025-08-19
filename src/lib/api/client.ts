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
	type TypedDocumentNode,
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
import type { DefinitionNode } from 'graphql';
import { getUserByJWT, setJwtWithUser } from '$lib/cache/user';

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

const tryRefreshToken = async (event: RequestEvent<Partial<Record<string, string>>, string | null>,) => {
	const refreshToken = event.cookies.get(REFRESH_TOKEN_KEY);
	const csrfToken = event.cookies.get(CSRF_TOKEN_KEY);

	// don't worry if refresh token or csrf token are empty, the refresh-token API will handle that
	const result = await event.fetch(
		`${AppRoute.AUTH_REFRESH_TOKEN()}`,
		{
			method: 'POST',
			body: JSON.stringify({
				refreshToken,
				csrfToken,
			}),
		}
	);

	return await result.json() as { user: User, [ACCESS_TOKEN_KEY]: string };
}

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

	if (!error || !(isAuthenError(error) || isAuthorError(error))) return false;

	await tryRefreshToken(event);
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
	query: DocumentInput<Data, Variables>,
	variables: Variables,
	event: RequestEvent<Partial<Record<string, string>>, string | null>,
	context?: Partial<OperationContext>
): Promise<OperationResult<Data, Variables>> => {
	const operationType = (query as TypedDocumentNode<Data, Variables>).definitions[0]['operation' as keyof DefinitionNode] as unknown as OperationType
	const newContext = attachAuthorizationHeaderToRequestIfNeeded(event, context);
	const request = createRequest(query, variables);
	const operation = GRAPHQL_CLIENT.createRequestOperation(operationType, request, newContext);
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

	// if there is no access token, we must try refresh token first
	if (!accessToken) {
		const result = await tryRefreshToken(event);
		if (result) {
			await setJwtWithUser(result[ACCESS_TOKEN_KEY], result.user);
			return result.user;
		}
	}

	// now we try looking up if the user existed in cache
	const user = await getUserByJWT(accessToken!);
	if (user) return user;

	// user not exist in cache, call to remote API backend
	const meQueryResult = await performServerSideGraphqlRequest<Pick<Query, 'me'>>(USER_ME_QUERY_STORE, {}, event, { requestPolicy: 'network-only' });

	if (meQueryResult.error) redirect(HTTPStatusTemporaryRedirect, `${AppRoute.AUTH_SIGNIN()}?next=${event.url.pathname}`);

	await setJwtWithUser(accessToken!, meQueryResult.data!.me!)
	return meQueryResult.data?.me as User;
};

/**
 * Make sure user is authenticated AND has all given permisions
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
