<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import type { AnyVariables, RequestPolicy, TypedDocumentNode } from '@urql/core';
	import Table from './table.svelte';
	import type { GraphqlPaginationArgs, RowOptions, SortState, TableProps } from './types';
	import { operationStore } from '$lib/api/operation';
	import { type PageInfo, type Query } from '$lib/gql/graphql';
	import TableSkeleton from './table-skeleton.svelte';
	import { Alert } from '$lib/components/ui/Alert';
	import { tick } from 'svelte';
	import { get } from 'es-toolkit/compat';

	type Props = {
		query: TypedDocumentNode<any, AnyVariables & GraphqlPaginationArgs>;
		variables: AnyVariables & GraphqlPaginationArgs;
		/** default to 'network-only' */
		requestPolicy?: RequestPolicy;
		/** for example the products query support pagination, then you must pass 'products' as resultKey */
		resultKey: keyof Query;
		/** a bindable prop, it acts as a lock to help you keep control of when to re-execute the graphql query, from parent component.
		 * Please note that your query will be paused by default, so you should set this prop to true when you want to re-execute the query.
		 */
		forceReExecuteGraphqlQuery?: boolean;
		/**
		 * tell the component how to reposition the items within the array list.
		 *
		 * if `swap-position`, then the 2 items at drag and drop position will be swapped.
		 *
		 * If `move-position`, then the drag item will move to the drop index
		 */
		dragEffectType?: 'swap-position' | 'move-position';
		onDragEnd?: (dragIndex: number, dragItem: T, dropIndex: number, dropItem: T) => void;
		/**
		 * if true, then the query will be re-executed when variable changes. Default to `true`
		 */
		autoRefetchOnVariableChange?: boolean;
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
		forceReExecuteGraphqlQuery = $bindable(true),
		resultKey,
		columns,
		tableClass,
		onDragEnd,
		dragEffectType,
		disabled,
		autoRefetchOnVariableChange = true,
	}: Props = $props();

	if ((dragEffectType && !onDragEnd) || (!dragEffectType && onDragEnd))
		throw new Error('dragEffectType and onDragEnd must be provided together');

	const queryOperationStore = operationStore<
		Pick<Query, typeof resultKey>,
		AnyVariables & GraphqlPaginationArgs
	>({
		kind: 'query',
		query,
		variables,
		requestPolicy,
		pause: true, // to prevent unnecessary network call, this operation will be paused by default
	});

	let sortState = $derived.by(() => {
		if (variables.sortBy?.field)
			return {
				[variables.sortBy.field]: variables.sortBy.direction,
			};

		return {};
	});
	let items = $state.raw<T[]>([]);
	let pagination = $state.raw<PageInfo>();

	$effect(() => {
		if (!$queryOperationStore.error && $queryOperationStore.data) {
			const connection = get($queryOperationStore.data, resultKey);

			if (!connection) throw new Error(`invalid result key: ${resultKey}`);

			items = connection.edges.map((edge: any) => edge?.node) || [];
			pagination = connection.pageInfo;
		}
	});

	$effect(() => {
		if (forceReExecuteGraphqlQuery) {
			queryOperationStore.reexecute({ variables, context: { requestPolicy: 'network-only' } });

			tick().then(() => {
				forceReExecuteGraphqlQuery = false;
			});
		}
	});

	const handleNextPageClick = (after: string) => {
		variables = {
			...variables,
			after,
			before: null,
			first: variables.first || variables.last,
			last: null,
		};
		if (autoRefetchOnVariableChange) forceReExecuteGraphqlQuery = true;
	};

	const handlePreviousPagelick = (before: string) => {
		variables = {
			...variables,
			before,
			after: null,
			last: variables.last || variables.first,
			first: null,
		};
		if (autoRefetchOnVariableChange) forceReExecuteGraphqlQuery = true;
	};

	const handleRowsPerPageChange = (num: RowOptions) => {
		variables = {
			...variables,
			first: num,
			last: null,
			before: null,
			after: null,
		};
		if (autoRefetchOnVariableChange) forceReExecuteGraphqlQuery = true;
	};

	const handleSortChange = (sort: SortState<K>) => {
		const keys = Object.keys(sort);
		if (!keys.length) return;

		const key = keys[0];
		const direction = sort[key as K];
		if (direction === 'NEUTRAL') return;

		variables = {
			...variables,
			first: 10,
			last: null,
			before: null,
			after: null,
			sortBy: {
				field: key,
				direction,
			},
		};
		if (autoRefetchOnVariableChange) forceReExecuteGraphqlQuery = true;
	};

	const innerHandleDragEnd = (dragIdx: number, dropIdx: number) => {
		if (dragIdx === dropIdx) return;

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
		onDragEnd?.(dragIdx, dragItem, dropIdx, dropItem);
	};
</script>

{#if $queryOperationStore.fetching}
	<TableSkeleton numColumns={columns.length} showPagination />
{:else if $queryOperationStore.error}
	<Alert variant="error" size="sm" bordered>
		{$queryOperationStore.error.message}
	</Alert>
{:else if $queryOperationStore.data}
	<div class="bg-white rounded-lg p-3 border border-gray-200">
		<Table
			{items}
			{columns}
			{pagination}
			onNextPagelick={handleNextPageClick}
			onPreviousPagelick={handlePreviousPagelick}
			onChangeRowsPerPage={handleRowsPerPageChange}
			onSortChange={handleSortChange}
			rowsPerPage={(variables.first || variables.last) as RowOptions}
			defaultSortState={sortState as SortState<K>}
			{tableClass}
			disabled={$queryOperationStore.fetching || disabled}
			onDragEnd={onDragEnd ? innerHandleDragEnd : undefined}
		/>
	</div>
{/if}
