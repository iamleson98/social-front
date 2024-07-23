import {
	cacheExchange,
	Client,
	CombinedError,
	createRequest,
	fetchExchange,
	type AnyVariables,
	type ClientOptions,
	type DocumentInput,
	type GraphQLRequest,
	type OperationContext,
	type OperationResult,
	type OperationResultSource,
	type OperationType,
	type RequestExtensions
} from '@urql/svelte';
import { getCookieByKey } from './utils';
import type { RequestEvent } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { ACCESS_TOKEN_KEY } from './utils/consts';
import {
	take,
	fromPromise,
	pipe,
	fromValue,
	type Sink,
	type Source,
	toPromise,
	filter,
	subscribe
} from 'wonka';

/**
 * Copied from @urql/core/utils/
 */
export function withPromise<T extends OperationResult>(
	_source$: Source<T>
): OperationResultSource<T> {
	const source$ = ((sink: Sink<T>) => _source$(sink)) as OperationResultSource<T>;
	source$.toPromise = () =>
		pipe(
			source$,
			filter((result) => !result.stale && !result.hasNext),
			take(1),
			toPromise
		);
	source$.then = (onResolve, onReject) => source$.toPromise().then(onResolve, onReject);
	source$.subscribe = (onResult) => subscribe(onResult)(source$);
	return source$;
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

	query<Data = unknown, Variables extends AnyVariables = AnyVariables>(
		query: DocumentInput<Data, Variables>,
		variables: Variables,
		context?: Partial<OperationContext>
	): OperationResultSource<OperationResult<Data, Variables>> {
		const newContext = this.attachAuthorizationHeaderToContextIfNedded('query', context);
		return super.query(query, variables, newContext);
	}

	mutation<Data = unknown, Variables extends AnyVariables = AnyVariables>(
		query: DocumentInput<Data, Variables>,
		variables: Variables,
		context?: Partial<OperationContext>
	): OperationResultSource<OperationResult<Data, Variables>> {
		const newContext = this.attachAuthorizationHeaderToContextIfNedded('mutation', context);
		// return super.mutation(query, variables, newContext);

		// var t: RequestExtensions;

		// const request = createRequest(query, variables);
		// const operation = super.createRequestOperation('mutation', request);
		// const mutationPromise = super.executeRequestOperation(operation);

		// let timeoutHolder: NodeJS.Timeout = null;

		// const timeoutPromise = new Promise<OperationResultSource<OperationResult<Data, Variables>>>(
		// 	(resolve) => {
		// 		timeoutHolder = setTimeout(() => {
		// 			const operationResult: OperationResult = {
		// 				error: new CombinedError({
		// 					networkError: new Error('Query timeout')
		// 				}),
		// 				stale: false,
		// 				hasNext: false,
		// 				operation
		// 			};
		// 			const source = fromValue(operationResult);
		// 			const withPrm = withPromise(source);
		// 			clearTimeout(timeoutHolder);
		// 			resolve(withPrm);
		// 		}, 5000);
		// 	}
		// );

		// const prmRace = Promise.race([timeoutPromise, mutationPromise]);
		// fromPromise(prmRace);

		const promise = new Promise<OperationResult<Data, Variables>>((resolve, reject) => {
			const timeout = setTimeout(() => {
				clearTimeout(timeout);
				reject(
					new CombinedError({
						networkError: new Error('Query timeout')
					})
				);
			}, 5000);

			super
				.mutation(query, variables, newContext)
				.toPromise()
				.then(resolve)
				.catch(reject)
				.finally(() => clearTimeout(timeout));
		});

		return withPromise(fromPromise(promise));
	}

	private attachAuthorizationHeaderToContextIfNedded = (
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
	 * This method is similar to `query` but is used for backend only
	 */
	backendQuery = <Data = never, Variables extends AnyVariables = AnyVariables>(
		query: DocumentInput<Data, Variables>,
		variables: Variables,
		event: RequestEvent<Partial<Record<string, string>>, string | null>,
		context?: Partial<OperationContext>
	): Promise<OperationResult<Data, Variables>> => {
		const newContext = this.attachAuthorizationHeaderToContextIfNedded('query', context, event);
		return this.query(query, variables, newContext).toPromise();
	};

	/**
	 * This method is similar to `mutation` but is used for backend
	 */
	backendMutation = <Data = never, Variables extends AnyVariables = AnyVariables>(
		query: DocumentInput<Data, Variables>,
		variables: Variables,
		event: RequestEvent<Partial<Record<string, string>>, string | null>,
		context?: Partial<OperationContext>
	): Promise<OperationResult<Data, Variables>> => {
		const newContext = this.attachAuthorizationHeaderToContextIfNedded('mutation', context, event);
		return this.mutation(query, variables, newContext).toPromise();
	};
}

/**
 * graphqlClient is similar to 'Client' of urql but with additional methods for server-side.
 */
export const graphqlClient = new SocialGraphqlClient({
	url: import.meta.env.VITE_GRAPHQL_API_END_POINT,
	exchanges: [cacheExchange, fetchExchange]
});
