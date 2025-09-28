<script lang="ts">
	import { PAGE_TYPES_QUERY } from '$lib/api/admin/page';
	import type {
		FilterComponentType,
		FilterItemValue,
		FilterProps,
	} from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { GraphqlPaginableSelect, type SelectOption } from '$lib/components/ui/select';
	import type { PageFilterInput, QueryPagesArgs, QueryPageTypesArgs } from '$lib/gql/graphql';

	type Props = {
		variables: QueryPagesArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

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
	bind:forceReExecuteGraphqlQuery
	searchKey="filter.search"
/>
