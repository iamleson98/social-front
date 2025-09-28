<script lang="ts">
	import { RFC3339TimeFormat } from '$lib/api/graphql/utils';
	import type { FilterComponentType, FilterProps } from '$lib/components/common/filter-box';
	import { FilterManager } from '$lib/components/common/filter-box';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { type QueryPromotionsArgs, type PromotionWhereInput } from '$lib/gql/graphql';
	import dayjs from 'dayjs';

	type Props = {
		variables: QueryPromotionsArgs;
		forceReExecuteGraphqlQuery: boolean;
	};

	let { variables = $bindable(), forceReExecuteGraphqlQuery = $bindable(false) }: Props = $props();

	const FilterOptions: FilterProps<PromotionWhereInput> = {
		startDate: {
			label: 'Start date',
			operations: {
				lte: date,
				gte: date,
			},
		},
		endDate: {
			label: 'End date',
			operations: {
				gte: date,
				lte: date,
			},
		},
	};

	$effect(() => {
		if (variables.where?.name && !Object.keys(variables.where.name).length)
			delete variables['where'];
	});
</script>

{#snippet date({ onValue, initialValue = '' }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		placeholder="Time"
		value={{ date: initialValue as string }}
		onchange={(val) => onValue(dayjs(val.date).format(RFC3339TimeFormat))}
		timeConfig={{
			stepMinutes: 1,
			format: 24,
			stepHours: 1,
		}}
		allowSelectMonthYears={{
			showMonths: true,
			showResetBtn: true,
			showYears: {
				min: 2020,
				max: 2050,
			},
		}}
	/>
{/snippet}

<FilterManager
	filterOptions={FilterOptions}
	bind:variables
	bind:forceReExecuteGraphqlQuery
	searchKey="where.name.eq"
/>
