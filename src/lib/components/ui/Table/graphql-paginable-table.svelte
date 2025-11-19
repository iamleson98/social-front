<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { type PageInfo, type Query } from '$lib/gql/graphql';
	import TableSkeleton from './table-skeleton.svelte';
	import Table from './table.svelte';
	import type {
		CountableConnection,
		GraphqlPaginationArgs,
		RowOptions,
		SortState,
		TableProps,
	} from './types';
	import type { AnyVariables, RequestPolicy, TypedDocumentNode } from '@urql/core';
	import { get } from 'es-toolkit/compat';
	import { onMount } from 'svelte';

	type Props = {
		query: TypedDocumentNode<any, AnyVariables & GraphqlPaginationArgs>;
		variables: AnyVariables & GraphqlPaginationArgs;
		/** default to 'network-only' */
		requestPolicy?: RequestPolicy;
		/** for example the products query support pagination, then you must pass 'products' as resultKey */
		resultKey: keyof Query;
		/**
		 * In some listing pages, url search params must be parsed before signalling the data fetching.
		 * But in some places, the table data does not depends on those url params, and data fetching need to be done immediately, right after the component in mounted.
		 *
		 * @default false
		 */
		autoFetchDataOnMount?: boolean;
		/**
		 * tell the component how to reposition the items within the array list.
		 *
		 * if `swap-position`, then the 2 items at drag and drop position will be swapped.
		 *
		 * If `move-position`, then the drag item will move to the drop index
		 */
		dragEffectType?: 'swap-position' | 'move-position';
		/**
		 * A callback function that will be called when the drag and drop action is completed.
		 * NOTE: If some of your columns contains interactive elements, like checkbox, input, link, textarea, select,
		 * Then you must add the attribute `data-interactive` to it
		 */
		onDragEnd?: (dragIndex: number, dragItem: T, dropIndex: number, dropItem: T) => void;
		/**
		 * if true, then the query will be re-executed when variable changes. Default to `false`
		 */
		autoRefetchOnPaginationParamsChange?: boolean;
	} & Omit<
		TableProps<T, K>,
		| 'items'
		| 'pagination'
		| 'onNextPagelick'
		| 'onPreviousPagelick'
		| 'onChangeRowsPerPage'
		| 'onSortChange'
		| 'rowsPerPage'
		| 'onDragEnd'
	>;

	let {
		query,
		variables = $bindable({
			first: 10,
		}),
		requestPolicy = 'cache-and-network',
		resultKey,
		columns,
		onDragEnd,
		dragEffectType,
		disabled,
		class: className,
		autoRefetchOnPaginationParamsChange = false,
		autoFetchDataOnMount = false,
	}: Props = $props();

	if ((dragEffectType && !onDragEnd) || (!dragEffectType && onDragEnd))
		throw new Error('dragEffectType and onDragEnd must be provided together');

	const queryOperationStore = operationStore<
		Pick<Query, typeof resultKey>,
		AnyVariables & GraphqlPaginationArgs
	>({
		query,
		variables,
		requestPolicy,
		pause: !autoFetchDataOnMount, // to prevent unnecessary network call, this operation will be paused by default
	});

	let sortState = $derived(
		variables.sortBy?.field ? { [variables.sortBy.field]: variables.sortBy.direction } : {},
	);
	let items = $state.raw<T[]>([]);
	let pagination = $state.raw<PageInfo>();

	onMount(() => {
		const unsub = queryOperationStore.subscribe((result) => {
			if (result.data) {
				const connection: CountableConnection<T> = get(result.data, resultKey);
				if (!connection) throw new Error(`invalid result key: ${resultKey}`);

				items = connection.edges.map((edge) => edge.node) || [];
				pagination = connection.pageInfo;
			}
		});

		return () => {
			unsub();
		};
	});

	export const triggerFetchData = () => {
		queryOperationStore.reexecute({ variables });
	};

	const handleNextPageClick = (after: string) => {
		variables = {
			...variables,
			after,
			before: null,
			first: variables.first || variables.last,
			last: null,
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const handlePreviousPagelick = (before: string) => {
		variables = {
			...variables,
			before,
			after: null,
			last: variables.last || variables.first,
			first: null,
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const handleRowsPerPageChange = (num: RowOptions) => {
		variables = {
			...variables,
			first: num,
			last: null,
			before: null,
			after: null,
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const handleSortChange = (sort: SortState<K>) => {
		const keys = Object.keys(sort);
		if (!keys.length) return;

		const key = keys[0];
		const direction = sort[key as K];
		if (direction === 'NEUTRAL') return;

		variables = {
			...variables,
			first: variables.first || variables.last || 10,
			last: null,
			before: null,
			after: null,
			sortBy: {
				field: key,
				direction,
			},
		};
		if (autoRefetchOnPaginationParamsChange) queryOperationStore.reexecute({ variables });
	};

	const innerHandleDragEnd = (dragIdx: number, dropIdx: number) => {
		if (dragIdx === dropIdx || !onDragEnd) return;

		const dragItem = items[dragIdx];
		const dropItem = items[dropIdx];
		const newItems = [...items];

		if (Math.abs(dragIdx - dropIdx) === 1 || dragEffectType === 'swap-position') {
			newItems[dragIdx] = newItems[dropIdx];
			newItems[dropIdx] = dragItem;
		} else if (dragEffectType === 'move-position') {
			const [dragItem] = newItems.splice(dragIdx, 1);
			newItems.splice(dropIdx, 0, dragItem);
		}

		items = newItems;
		onDragEnd(dragIdx, dragItem, dropIdx, dropItem);
	};
</script>

{#if $queryOperationStore.fetching}
	<TableSkeleton numColumns={columns.length} />
{:else if $queryOperationStore.error}
	<Alert variant="error" size="sm" bordered>
		{$queryOperationStore.error.message}
	</Alert>
{:else if $queryOperationStore.data}
	<Table
		{items}
		{columns}
		graphqlPagination={pagination}
		onNextPagelick={handleNextPageClick}
		onPreviousPagelick={handlePreviousPagelick}
		onChangeRowsPerPage={handleRowsPerPageChange}
		onSortChange={handleSortChange}
		rowsPerPage={(variables.first || variables.last) as RowOptions}
		defaultSortState={sortState as SortState<K>}
		class={className}
		disabled={$queryOperationStore.fetching || disabled}
		onDragEnd={onDragEnd ? innerHandleDragEnd : undefined}
	/>
{/if}
