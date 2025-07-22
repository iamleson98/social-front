import { GRAPHQL_CLIENT } from '$lib/api/client';
import {
	createRequest,
	type AnyVariables,
	type GraphQLRequestParams,
	type OperationContext,
	type OperationResult,
	type OperationType,
	type RequestPolicy
} from '@urql/core';
import { derived, writable, type Readable, type Writable } from 'svelte/store';
import {
	concat,
	fromValue,
	make,
	map,
	pipe,
	scan,
	subscribe,
	switchMap,
	type Source,
	never
} from 'wonka';

export interface OperationResultState<Data = unknown, Variables extends AnyVariables = AnyVariables>
	extends OperationResult<Data, Variables> {
	fetching: boolean;
}

export type OperationResultStore<
	Data = unknown,
	Variables extends AnyVariables = AnyVariables
> = Readable<OperationResultState<Data, Variables>>;

export const fromStore = <T>(store$: Readable<T>): Source<T> =>
	make((observer) => store$.subscribe(observer.next));

export const initialResult = {
	operation: undefined,
	fetching: false,
	data: undefined,
	error: undefined,
	extensions: undefined,
	hasNext: false,
	stale: false
};

export interface Pausable {
	isPaused$: Writable<boolean>;
	pause(): void;
	resume(): void;
}

export const createPausable = (isPaused$: Writable<boolean>): Pausable => ({
	isPaused$,
	pause() {
		isPaused$.set(true);
	},
	resume() {
		isPaused$.set(false);
	}
});

export type OperationArgs<Data = unknown, Variables extends AnyVariables = AnyVariables> = {
	context?: Partial<OperationContext>;
	requestPolicy?: RequestPolicy;
	pause?: boolean;
	kind: OperationType;
} & GraphQLRequestParams<Data, Variables>;

type ReexecuteProps<Variables extends AnyVariables = AnyVariables> = {
	context?: Partial<OperationContext>;
	variables?: Partial<Variables>;
};

/**
 * Create a store for a GraphQL operation
 * @param args
 * @returns
 */
export function operationStore<Data = unknown, Variables extends AnyVariables = AnyVariables>(
	args: OperationArgs
): OperationResultStore<Data, Variables> &
	Pausable & { reexecute: (args: ReexecuteProps<Variables>) => void } {
	const request = createRequest<Data, Variables>(args.query, args.variables as Variables);

	const context: Partial<OperationContext> = {
		requestPolicy: args.requestPolicy,
		...args.context
	};

	const operation = GRAPHQL_CLIENT.createRequestOperation<Data, Variables>(
		args.kind,
		request,
		context
	);

	const operation$ = writable(operation);

	const initialState: OperationResultState<Data, Variables> = {
		...initialResult,
		operation
	};

	const isPaused$ = writable(args.pause);

	const result$ = writable(initialState, () => {
		const { unsubscribe } = pipe(
			fromStore(isPaused$),
			switchMap((isPaused): Source<Partial<OperationResultState<Data, Variables>>> => {
				if (isPaused) {
					return never as never;
				}

				return pipe(
					fromStore(operation$),
					switchMap((operation) => {
						return concat<Partial<OperationResultState<Data, Variables>>>([
							fromValue({ fetching: true, stale: false }),
							pipe(
								GRAPHQL_CLIENT.executeRequestOperation(operation),
								map(({ stale, data, error, extensions, operation }) => ({
									fetching: false,
									stale: !!stale,
									data,
									error,
									operation,
									extensions
								}))
							),
							fromValue({ fetching: false })
						]);
					})
				);
			}),
			scan(
				(result: OperationResultState<Data, Variables>, partial) => ({
					...result,
					...partial
				}),
				initialState
			),
			subscribe((result) => {
				result$.set(result);
			})
		);

		return unsubscribe;
	});

	const reexecute = (args: ReexecuteProps<Variables>): void => {
		const newContext = { ...context, ...args.context };
		request.variables = { ...request.variables, ...args.variables };
		const newOperation = GRAPHQL_CLIENT.createRequestOperation(operation.kind, request, newContext);

		isPaused$.set(false);
		operation$.set(newOperation);
	};

	return {
		reexecute,
		...derived(result$, (result, set) => set(result)),
		...createPausable(isPaused$)
	};
}
