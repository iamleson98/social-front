<script lang="ts">
	import { tranFunc } from '$i18n';
	import type { FilterProps } from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { CommonSnippets } from '$lib/components/common/filter-box/snippets.svelte';
	import { type QueryPromotionsArgs, type PromotionWhereInput } from '$lib/gql/graphql';
	import { set } from 'es-toolkit/compat';

	type Props = {
		variables: QueryPromotionsArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

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
	bind:forceReExecuteGraphqlQuery
	searchKey="where.name.eq"
	variablePatchingCallbackAfterReload={(filterVariables, params) => {
		const { startDate, endDate } = params;

		if (startDate)
			set(filterVariables, 'where.startDate.range', { [startDate.operator]: startDate.value });
		if (endDate) set(filterVariables, 'where.endDate.range', { [endDate.operator]: endDate.value });

		return filterVariables;
	}}
/>
