<script lang="ts">
	import { WAREHOUSE_LIST_QUERY } from '$lib/api/admin/warehouse';
	import { type SelectProps } from '$lib/components/ui/select';
	import GraphqlPaginableSelect from '../ui/select/graphql-paginable-select.svelte';

	let { value = $bindable(), size = 'md', ...rest }: Omit<SelectProps, 'options'> = $props();
</script>

<GraphqlPaginableSelect
	optionValueKey="id"
	optionLabelKey="name"
	query={WAREHOUSE_LIST_QUERY}
	bind:value
	variables={{
		first: 10,
		filter: {
			search: '',
		},
	}}
	resultKey="warehouses"
	variableSearchQueryPath="filter.search"
	{...rest}
/>
