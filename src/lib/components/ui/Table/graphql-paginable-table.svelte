<script lang="ts" generics="T extends Record<string, unknown>, K extends string">
	import type { AnyVariables, RequestPolicy, TypedDocumentNode } from '@urql/core';
	import Table from './table.svelte';
	import type { GraphqlPaginationArgs, RowOptions, SortState, TableProps } from './types';
	import { operationStore } from '$lib/api/operation';
	import type { Query } from '$lib/gql/graphql';
	import TableSkeleton from './table-skeleton.svelte';
	import Alert from '../Alert/alert.svelte';
	import { tick } from 'svelte';

	type Props = {
		query: TypedDocumentNode<any, AnyVariables & GraphqlPaginationArgs>;
		variables: AnyVariables & GraphqlPaginationArgs;
		/** default to 'cache-and-network' */
		requestPolicy?: RequestPolicy;
		/** for example the products query support pagination, then you must pass 'products' as resultKey */
		resultKey: keyof Query;
		forceReExecuteGraphqlQuery: boolean;
	} & TableProps<T, K>;

	let {
		query,
		variables = $bindable({
			first: 10
		}),
		requestPolicy = 'network-only',
		forceReExecuteGraphqlQuery = $bindable(),
		resultKey,
		columns,
		tableClass
	}: Props = $props();

	const queryOperationStore = operationStore<
		Pick<Query, typeof resultKey>,
		AnyVariables & GraphqlPaginationArgs
	>({
		kind: 'query',
		query,
		variables,
		requestPolicy
	});

	let sortState = $state<SortState<K>>({} as SortState<K>);

	$effect(() => {
		if (forceReExecuteGraphqlQuery) {
			queryOperationStore.reexecute({ variables });

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
			last: null
		};
		forceReExecuteGraphqlQuery = true;
	};

	const handlePreviousPagelick = (before: string) => {
		variables = {
			...variables,
			before,
			after: null,
			last: variables.last || variables.first,
			first: null
		};
		forceReExecuteGraphqlQuery = true;
	};

	const handleRowsPerPageChange = (num: RowOptions) => {
		variables = {
			...variables,
			first: num,
			last: null,
			before: null,
			after: null
		};
		forceReExecuteGraphqlQuery = true;
	};

	const handleSortChange = (sort: SortState<K>) => {
		const keys = Object.keys(sort);
		if (!keys.length) return;

		const key = keys[0];
		const direction = sort[key as K];
		if (direction === 'NEUTRAL') return;

		sortState = sort;

		variables = {
			...variables,
			first: 10,
			last: null,
			before: null,
			after: null,
			sortBy: {
				field: key,
				direction
			}
		};
		forceReExecuteGraphqlQuery = true;
	};
</script>

<div class="bg-white rounded-lg p-4 border border-gray-200">
	{#if $queryOperationStore.fetching}
		<TableSkeleton numColumns={columns.length} showPagination />
	{:else if $queryOperationStore.error}
		<Alert variant="error" size="sm" bordered>
			{$queryOperationStore.error.message}
		</Alert>
	{:else if $queryOperationStore.data?.[resultKey]}
		{@const pagination = $queryOperationStore.data?.[resultKey].pageInfo}
		{@const items =
			$queryOperationStore.data?.[resultKey].edges?.map((edge: any) => edge?.node) || []}
		<Table
			{items}
			{columns}
			{pagination}
			onNextPagelick={handleNextPageClick}
			onPreviousPagelick={handlePreviousPagelick}
			onChangeRowsPerPage={handleRowsPerPageChange}
			onSortChange={handleSortChange}
			rowsPerPage={(variables.first || variables.last) as RowOptions}
			defaultSortState={sortState}
			{tableClass}
			disabled={$queryOperationStore.fetching}
		/>
	{/if}
</div>
