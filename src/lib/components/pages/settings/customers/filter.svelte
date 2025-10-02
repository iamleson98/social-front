<script lang="ts">
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import type { FilterProps } from '$lib/components/common/filter-box/types';
	import type { CustomerFilterInput, QueryCustomersArgs } from '$lib/gql/graphql';

	type Props = {
		variables: QueryCustomersArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable() }: Props = $props();

	const FilterOptions: FilterProps<CustomerFilterInput> = {
		dateJoined: {
			label: 'Join date',
			operations: {
				lte: CommonSnippets.singleDate,
				gte: CommonSnippets.singleDate,
				range: CommonSnippets.dateRange,
			},
		},
		numberOfOrders: {
			label: 'Number of orders',
			operations: {
				eq: CommonSnippets.singleNumber,
				gte: CommonSnippets.singleNumber,
				lte: CommonSnippets.singleNumber,
				range: CommonSnippets.numberRange,
			},
		},
		metadata: {
			label: 'Metadata',
			operations: {
				eq: CommonSnippets.metadata,
			},
		},
	};
</script>

<FilterManager
	filterOptions={FilterOptions}
	bind:forceReExecuteGraphqlQuery
	bind:variables
	searchKey={'filter.search' as keyof QueryCustomersArgs}
	variablePatchingCallbackAfterReload={(variables, searchParams) => {
		const { dateJoined, numberOfOrders, metadata } = searchParams;

		if (!variables.filter) variables.filter = {};

		if (dateJoined) {
			if (dateJoined.operator === 'range' && Array.isArray(dateJoined.value))
				variables.filter.dateJoined = {
					gte: dateJoined.value[0],
					lte: dateJoined.value[1],
				};
			else if (['lte', 'gte'].includes(dateJoined.operator)) {
				variables.filter.dateJoined = { [dateJoined.operator]: dateJoined.value };
			}
		}

		if (numberOfOrders) {
			if (numberOfOrders.operator === 'eq')
				variables.filter.numberOfOrders = {
					gte: numberOfOrders.value as number,
					lte: numberOfOrders.value as number,
				};
			else if (['lte', 'gte'].includes(numberOfOrders.operator))
				variables.filter.numberOfOrders = { [numberOfOrders.operator]: numberOfOrders.value };
			else if (numberOfOrders.operator === 'range' && Array.isArray(numberOfOrders.value))
				variables.filter.numberOfOrders = {
					gte: numberOfOrders.value[0] as number,
					lte: numberOfOrders.value[1] as number,
				};
		}

		if (metadata) {
			if (metadata.operator === 'eq') {
				variables.filter.metadata = [
					{
						key: (metadata.value as string[])[0],
						value: (metadata.value as string[])[1],
					},
				];
			}
		}

		return variables;
	}}
/>
