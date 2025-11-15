<script lang="ts">
	import { PAGE_TYPES_QUERY } from '$lib/api/admin/page';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { reFetchTableData } from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import type { PageFilterInput, QueryPagesArgs, QueryPageTypesArgs } from '$lib/gql/graphql';

	type Props = {
		variables: QueryPagesArgs;
	};

	let { variables = $bindable() }: Props = $props();

	const FilterOptions: FilterProps<PageFilterInput> = {
		pageTypes: {
			label: 'Blog type',
			operations: {
				oneOf: oneOf,
			},
		},
	};
</script>

{#snippet oneOf({ onValue, initialValue = [] }: FilterComponentType)}
	<GraphqlPaginableSelect
		size="xs"
		query={PAGE_TYPES_QUERY}
		variableSearchQueryPath="filter.search"
		variables={{ first: 15, filter: { search: '' } } as QueryPageTypesArgs}
		resultKey="pageTypes"
		optionLabelKey="name"
		optionValueKey="id"
		multiple
		value={initialValue}
		onchange={(opts) =>
			onValue((opts as SelectOption[])?.map((opt) => opt.value) as FilterItemValue)}
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	onRefetchData={() => reFetchTableData(TableNameKeys.BlogsTable)}
	searchKey="filter.search"
	variablePatchingCallbackAfterReload={(filterVariables, params) => {
		const { pageTypes, search } = params;

		if (!filterVariables.filter) filterVariables.filter = {};

		if (pageTypes && Array.isArray(pageTypes.value))
			filterVariables.filter.pageTypes = pageTypes.value as string[];
		if (search && search.value) filterVariables.filter.search = search.value as string;

		return filterVariables;
	}}
/>
