<script lang="ts">
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import FilterManager from '$lib/components/common/filter-box/filter-manager.svelte';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { type QueryPromotionsArgs, type PromotionWhereInput } from '$lib/gql/graphql';

	type Props = {
		variables: QueryPromotionsArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const FILTER_OPTIONS: FilterProps<PromotionWhereInput>[] = [
		{
			label: 'Start date',
			key: 'startDate',
			operations: [
				{
					operator: 'lte',
					component: date,
				},
				{
					operator: 'gte',
					component: date,
				},
			],
		},
		{
			label: 'End date',
			key: 'endDate',
			operations: [
				{
					operator: 'gte',
					component: date,
				},
				{
					operator: 'lte',
					component: date,
				},
			],
		},
	];
</script>

{#snippet date({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder="Time"
		value={{ date: initialValue as string }}
		onchange={(val) => onValue(val.date!.toString())}
	/>
{/snippet}

<FilterManager filterOptions={FILTER_OPTIONS} bind:variables bind:forceReExecuteGraphqlQuery />
