<script lang="ts">
	import { tranFunc } from '$i18n';
	import type { FilterProps } from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import { reFetchTableData } from '$lib/components/ui/Table';
	import { TableNameKeys } from '$lib/components/ui/Table/graphql-paginable-table.svelte';
	import { type QueryPromotionsArgs, type PromotionWhereInput } from '$lib/gql/graphql';
	import { set } from 'es-toolkit/compat';

	type Props = {
		variables: QueryPromotionsArgs;
	};

	let { variables = $bindable() }: Props = $props();

	const FilterOptions: FilterProps<PromotionWhereInput> = {
		startDate: {
			label: $tranFunc('common.startAt'),
			operations: {
				lte: CommonSnippets.singleDatetime,
				gte: CommonSnippets.singleDatetime,
			},
		},
		endDate: {
			label: $tranFunc('common.endAt'),
			operations: {
				gte: CommonSnippets.singleDatetime,
				lte: CommonSnippets.singleDatetime,
			},
		},
	};

	$effect(() => {
		if (variables.where?.name && !Object.keys(variables.where.name).length)
			delete variables['where'];
	});
</script>

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	onRefetchData={() => reFetchTableData(TableNameKeys.PromotionsTable)}
	searchKey="where.name.eq"
	variablePatchingCallbackAfterReload={(filterVariables, params) => {
		const { startDate, endDate } = params;

		if (startDate)
			set(filterVariables, 'where.startDate.range', { [startDate.operator]: startDate.value });
		if (endDate) set(filterVariables, 'where.endDate.range', { [endDate.operator]: endDate.value });

		return filterVariables;
	}}
/>
