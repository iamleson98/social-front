<script lang="ts">
	import { tranFunc } from '$i18n';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import type { FilterProps } from '$lib/components/common/filter-box/types';
	import type { GraphqlPaginableTableInterface } from '$lib/components/ui/Table';
	import type { CustomerFilterInput, QueryCustomersArgs } from '$lib/gql/graphql';

	type Props = {
		variables: QueryCustomersArgs;
		tableRef?: GraphqlPaginableTableInterface;
	};

	let { variables = $bindable(), tableRef }: Props = $props();

	const FilterOptions: FilterProps<CustomerFilterInput> = {
		dateJoined: {
			label: $tranFunc('staff.joinedSince'),
			operations: {
				lte: CommonSnippets.singleDate,
				gte: CommonSnippets.singleDate,
				range: CommonSnippets.dateRange,
			},
		},
		numberOfOrders: {
			label: $tranFunc('customer.numOfOrders'),
			operations: {
				eq: CommonSnippets.singleNumber,
				gte: CommonSnippets.singleNumber,
				lte: CommonSnippets.singleNumber,
				range: CommonSnippets.numberRange,
			},
		},
		metadata: {
			label: $tranFunc('common.metadata'),
			operations: {
				eq: CommonSnippets.metadata,
			},
		},
	};
</script>

<FilterManager
	filterOptions={FilterOptions}
	onRefetchData={() => tableRef?.triggerFetchData()}
	bind:variables
	searchKey={'filter.search' as keyof QueryCustomersArgs}
	variablePatchingCallbackAfterReload={(vars, searchParams) => {
		const { dateJoined, numberOfOrders, metadata } = searchParams;

		if (!vars.filter) vars.filter = {};

		if (dateJoined) {
			if (dateJoined.operator === 'range' && Array.isArray(dateJoined.value))
				vars.filter.dateJoined = {
					gte: dateJoined.value[0],
					lte: dateJoined.value[1],
				};
			else if (['lte', 'gte'].includes(dateJoined.operator)) {
				vars.filter.dateJoined = { [dateJoined.operator]: dateJoined.value };
			}
		}

		if (numberOfOrders) {
			if (numberOfOrders.operator === 'eq')
				vars.filter.numberOfOrders = {
					gte: numberOfOrders.value as number,
					lte: numberOfOrders.value as number,
				};
			else if (['lte', 'gte'].includes(numberOfOrders.operator))
				vars.filter.numberOfOrders = { [numberOfOrders.operator]: numberOfOrders.value };
			else if (numberOfOrders.operator === 'range' && Array.isArray(numberOfOrders.value))
				vars.filter.numberOfOrders = {
					gte: numberOfOrders.value[0] as number,
					lte: numberOfOrders.value[1] as number,
				};
		}

		if (metadata) {
			if (metadata.operator === 'eq') {
				vars.filter.metadata = [
					{
						key: (metadata.value as string[])[0],
						value: (metadata.value as string[])[1],
					},
				];
			}
		}

		return vars;
	}}
/>
