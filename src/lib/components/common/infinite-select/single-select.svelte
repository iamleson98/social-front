<script lang="ts">
	import { operationStore } from '$lib/api/operation';
	import { Alert } from '$lib/components/ui/Alert';
	import { Select, type SelectOption } from '$lib/components/ui/select';
	import { type Query } from '$lib/gql/graphql';
	import type { CountableConnection } from '$lib/utils/consts';
	import type { RequestPolicy, TypedDocumentNode } from '@urql/core';
	import { onMount } from 'svelte';

	type QueryKey = keyof Query;

	type Props = {
		/** NOTE: you must also query for pagination information */
		query: TypedDocumentNode<any, any>;
		first?: number;
		last?: number;
		after?: string;
		before?: string;
		requestPolicy?: RequestPolicy;
		queryKey: QueryKey;

		/** each select item must be of type `{ value: string; label: string }` */
		selectLabelKey: string;
		/** each select item must be of type `{ value: string; label: string }` */
		selectValueKey: string;
	};

	let {
		query,
		first,
		last,
		after,
		before,
		requestPolicy = 'network-only',
		queryKey,
		selectLabelKey,
		selectValueKey
	}: Props = $props();

	let selectOptions = $state.raw<SelectOption[]>([]);
	const ORDER_INCREASE = typeof first === 'number';
	const MEET_MAP: Record<string, boolean> = {};

	const QUERY_STORE = operationStore<Pick<Query, typeof queryKey>, any>({
		kind: 'query',
		query,
		requestPolicy,
		variables: {
			first,
			last,
			after,
			before
		}
	});

	onMount(() =>
		QUERY_STORE.subscribe((result) => {
			if (!result.data) return;
			const key = `${result.operation.variables.before}${result.operation.variables.after}`;
			if (MEET_MAP[key]) return;
			MEET_MAP[key] = true;

			const connection: CountableConnection = result.data[queryKey];
			if (!connection.edges)
				throw new Error('Your query must return a graphql CountableConnection type');

			const newSelectOptions = connection.edges.map<SelectOption>((item) => ({
				value: item.node[selectValueKey] as string | number,
				label: item.node[selectLabelKey] as string
			}));

			selectOptions = selectOptions.concat(newSelectOptions);
		})
	);

	const handleScrollToEnd = () => {
		if ($QUERY_STORE.fetching || $QUERY_STORE.error || !$QUERY_STORE.data) return;

		const connection: CountableConnection = $QUERY_STORE.data[queryKey];
		if (
			!connection.pageInfo ||
			(!connection.pageInfo.hasNextPage && !connection.pageInfo.hasPreviousPage) ||
      (!connection.pageInfo.startCursor && !connection.pageInfo.endCursor)
		)
			return;

		QUERY_STORE.reexecute({
			variables: ORDER_INCREASE
				? {
						first: first,
						after: connection.pageInfo.endCursor
					}
				: {
						last: last,
						before: connection.pageInfo.startCursor
					}
		});
	};
</script>

{#if $QUERY_STORE.error}
	<Alert variant="error" size="sm" bordered>{$QUERY_STORE.error.message}</Alert>
{:else}
	<Select
		options={selectOptions}
		onScrollToEnd={handleScrollToEnd}
		loading={$QUERY_STORE.fetching}
	/>
{/if}
