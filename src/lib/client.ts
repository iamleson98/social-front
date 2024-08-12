import {
	cacheExchange,
	Client,
	CombinedError,
	createRequest,
	fetchExchange,
	type AnyVariables,
	type ClientOptions,
	type DocumentInput,
	type Operation,
	type OperationContext,
	type OperationResult,
	type OperationResultSource,
	type OperationType,
} from '@urql/svelte';
import { AppRoute, getCookieByKey } from './utils';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { ACCESS_TOKEN_KEY, CSRF_TOKEN_KEY, HTTPStatusTemporaryRedirect, REFRESH_TOKEN_KEY } from './utils/consts';
import { authExchange } from '@urql/exchange-auth';
import { USER_ME_QUERY_STORE, USER_REFRESH_TOKEN_MUTATION_STORE } from './stores/api';
import type { Mutation, Query, User } from './gql/graphql';
import { userStore } from './stores/auth';
import type { CookieSerializeOptions } from 'cookie';
import { goto } from '$app/navigation';


export const MAX_REFRESH_TOKEN_TRIES = 3;
export const cookieOpts: CookieSerializeOptions & { path: string } = {
	path: '/',
	secure: true,
	maxAge: 24 * 60 * 60,
	httpOnly: false, // TODO: find a way to make it work
};

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
			return true;
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
			return true;
		}
	}

	return false;
}

const suggestMethodMap: Record<OperationType, string> = {
	query: 'backendQuery',
	mutation: 'backendMutation',
	subscription: 'backendSubscription',
	teardown: 'backendTeardown'
};

class SocialGraphqlClient extends Client {
	constructor(options: ClientOptions) {
		super(options);
	}

	private attachAuthorizationHeaderToRequestIfNeeded = (
		operation: OperationType,
		context?: Partial<OperationContext>,
		event?: RequestEvent<Partial<Record<string, string>>, string | null>
	) => {
		if (!browser && !event) {
			throw new Error(
				`Calling API from server-side requires RequestEvent. Please use ${suggestMethodMap[operation]} instead.`
			);
		}

		const newContext = context || {};
		let accessToken = '';

		if (browser) {
			accessToken = getCookieByKey(ACCESS_TOKEN_KEY);
		} else if (event) {
			accessToken = event.cookies.get(ACCESS_TOKEN_KEY) || '';
		}

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
	 * @param result 
	 * @param event 
	 * @returns `true` means callers MUST run the operation again, `false` otherwise.
	 */
	private checkIsAuthenAuthorErrorAndRedirectIfNeeded = async <Data = never, Variables extends AnyVariables = AnyVariables>(
		result: OperationResult<Data, Variables>,
		event: RequestEvent<Partial<Record<string, string>>, string | null>,
	): Promise<boolean> => {
		if (!result.error || !(isAuthorError(result.error) || isAuthenError(result.error))) {
			return false;
		}

		// If we reach here, it means we have an authen or author error
		event.cookies.delete(ACCESS_TOKEN_KEY, { path: '/', maxAge: 0, secure: true });

		const csrfToken = event.cookies.get(CSRF_TOKEN_KEY);
		const refreshToken = event.cookies.get(REFRESH_TOKEN_KEY);

		if (!csrfToken || !refreshToken) {
			redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
		}

		const refreshResult = await this
			.mutation<Pick<Mutation, 'tokenRefresh'>>(
				USER_REFRESH_TOKEN_MUTATION_STORE,
				{ csrfToken, refreshToken, },
				{ requestPolicy: 'network-only' }
			)
			.toPromise();

		if (refreshResult.error || refreshResult.data?.tokenRefresh?.errors.length) {
			event.cookies.delete(CSRF_TOKEN_KEY, { path: '/', maxAge: 0 });
			event.cookies.delete(REFRESH_TOKEN_KEY, { path: '/', maxAge: 0 });
			redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
		};

		// set new access token to cookie (NO HTTPONLY)
		event.cookies.set(ACCESS_TOKEN_KEY, refreshResult.data?.tokenRefresh?.token as string, cookieOpts);
		return true;
	};

	pageRequiresAuthentication = async (event: RequestEvent<Partial<Record<string, string>>, string | null>) => {
		const accessToken = event.cookies.get(ACCESS_TOKEN_KEY);
		if (!accessToken) {
			redirect(HTTPStatusTemporaryRedirect, AppRoute.AUTH_SIGNIN);
		}

		const meQueryResult = await this.backendQuery<Pick<Query, 'me'>>(USER_ME_QUERY_STORE, {}, event);
		return meQueryResult.data?.me as User;
	};

	/**
	 * This method is similar to `query` but is used for backend only
	 */
	backendQuery = async <Data = never, Variables extends AnyVariables = AnyVariables>(
		query: DocumentInput<Data, Variables>,
		variables: Variables,
		event: RequestEvent<Partial<Record<string, string>>, string | null>,
		context?: Partial<OperationContext>
	): Promise<OperationResult<Data, Variables>> => {
		const newContext = this.attachAuthorizationHeaderToRequestIfNeeded('query', context, event);
		const request = createRequest(query, variables);
		const operation = this.createRequestOperation('query', request, newContext);
		const result = await this.executeRequestOperation(operation).toPromise();
		const mustRetryOperation = await this.checkIsAuthenAuthorErrorAndRedirectIfNeeded(result, event);
		if (!mustRetryOperation) return result;

		operation.context = {
			...operation.context,
			...this.attachAuthorizationHeaderToRequestIfNeeded('query', context, event),
		};
		return this.executeRequestOperation(operation).toPromise();
	};

	/**
	 * This method is similar to `mutation` but is used for backend
	 */
	backendMutation = async <Data = never, Variables extends AnyVariables = AnyVariables>(
		query: DocumentInput<Data, Variables>,
		variables: Variables,
		event: RequestEvent<Partial<Record<string, string>>, string | null>,
		context?: Partial<OperationContext>
	): Promise<OperationResult<Data, Variables>> => {
		const newContext = this.attachAuthorizationHeaderToRequestIfNeeded('mutation', context, event);
		const request = createRequest(query, variables);
		const operation = this.createRequestOperation('mutation', request, newContext);
		const result = await this.executeRequestOperation(operation).toPromise();
		const mustRetryOperation = await this.checkIsAuthenAuthorErrorAndRedirectIfNeeded(result, event);
		if (!mustRetryOperation) return result;

		operation.context = {
			...operation.context,
			...this.attachAuthorizationHeaderToRequestIfNeeded('mutation', context, event),
		};
		return this.executeRequestOperation(operation).toPromise();
	};

	query<Data = unknown, Variables extends AnyVariables = AnyVariables>(query: DocumentInput<Data, Variables>, variables: Variables, context?: Partial<OperationContext>): OperationResultSource<OperationResult<Data, Variables>> {
		return super.query(query, variables, context);
	}
}


/**
 * graphqlClient is similar to 'Client' of urql but with additional methods for server-side.
 */
export const graphqlClient = new SocialGraphqlClient({
	url: import.meta.env.VITE_GRAPHQL_API_END_POINT,
	exchanges: [
		// this auth exchange can run on slient side only
		authExchange(async (utils) => {
			const addAuthToOperation = (operation: Operation) => {
				if (browser) {
					const accessToken = getCookieByKey(ACCESS_TOKEN_KEY);
					if (accessToken) {
						return utils.appendHeaders(operation, {
							Authorization: `Bearer ${accessToken}`,
						});
					}

					return operation;
				}

				return operation;
			}

			const refreshAuth = async () => {
				if (browser) {
					document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; secure; max-age=0`;

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
						document.cookie = `${CSRF_TOKEN_KEY}=; path=/; secure; max-age=0`;
						document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; secure; max-age=0`;
						await goto(AppRoute.AUTH_SIGNIN, { invalidateAll: true });
					};

					document.cookie = `${ACCESS_TOKEN_KEY}=${result.data?.tokenRefresh?.token}; path=/; secure; max-age=86400`;
					userStore.set(result.data?.tokenRefresh?.user);
				}
			}

			return {
				addAuthToOperation,
				didAuthError: (error) => (isAuthorError(error) || isAuthenError(error)),
				refreshAuth,
			};
		}),
		cacheExchange,
		fetchExchange,
	],
});
