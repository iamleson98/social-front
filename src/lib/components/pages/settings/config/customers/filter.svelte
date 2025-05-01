<script lang="ts">
	import FilterButton from '$lib/components/common/filter-box/filter-button.svelte';
	import type {
		FilterComponentType,
		FilterConditions,
		FilterProps
	} from '$lib/components/common/filter-box/types';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';
	import type { CustomerFilterInput, IntRangeInput } from '$lib/gql/graphql';
	import dayjs from 'dayjs';

	type Props = {
		onFilterChange: (filter: CustomerFilterInput) => void;
	};

	let { onFilterChange }: Props = $props();

	const FILTER_OPTIONS: FilterProps<CustomerFilterInput>[] = [
		{
			label: 'Join date',
			key: 'dateJoined',
			operation: [
				{
					operator: 'lte',
					component: joinDateSingle
				},
				{
					operator: 'gte',
					component: joinDateSingle
				},
				{
					operator: 'range',
					component: joinDateBetween
				}
			]
		},
		{
			label: 'Number of orders',
			key: 'numberOfOrders',
			operation: [
				{
					operator: 'oneOf',
					component: numberOfOrdersSingle
				},
				{
					operator: 'gte',
					component: numberOfOrdersSingle
				},
				{
					operator: 'lte',
					component: numberOfOrdersSingle
				},
				{
					operator: 'range',
					component: numberOfOrdersBetween
				}
			]
		}
	];

	const handleApply = (conditions: FilterConditions<CustomerFilterInput>) => {
		const newFilters = {} as CustomerFilterInput;
		let conditionChanged = false;

		if ('dateJoined' in conditions) {
			conditionChanged = true; //

			if ('range' in conditions.dateJoined && Array.isArray(conditions.dateJoined.range)) {
				newFilters.dateJoined = {
					gte: conditions.dateJoined.range[0],
					lte: conditions.dateJoined.range[1]
				};
			} else {
				newFilters.dateJoined = conditions.dateJoined;
			}
		}

		if ('numberOfOrders' in conditions) {
			conditionChanged = true; //

			if ('range' in conditions.numberOfOrders && Array.isArray(conditions.numberOfOrders.range)) {
				newFilters.numberOfOrders = {
					gte: conditions.numberOfOrders.range[0] as number,
					lte: conditions.numberOfOrders.range[1] as number
				};
			} else {
				newFilters.numberOfOrders = conditions.numberOfOrders as IntRangeInput;
			}
		}

		if (conditionChanged) onFilterChange(newFilters);
	};
</script>

{#snippet joinDateSingle({ onValue, initialValue, placeholder }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		value={{ date: initialValue as string }}
		onchange={(value) => {
			onValue(dayjs(value.date).format('YYYY-MM-DD'));
		}}
		{placeholder}
		timeConfig={false}
		autoApply={false}
	/>
{/snippet}

{#snippet joinDateBetween({ onValue, initialValue }: FilterComponentType)}
	{@const range = (initialValue || ['', '']) as string[]}
	<div class="flex flex-col gap-1">
		{@render joinDateSingle({
			onValue: (value) => {
				range[0] = value as string;
				onValue(range);
			},
			initialValue: range[0],
			placeholder: 'Start date'
		})}
		{@render joinDateSingle({
			onValue: (value) => {
				range[1] = value as string;
				onValue(range);
			},
			initialValue: range[1],
			placeholder: 'End date'
		})}
	</div>
{/snippet}

{#snippet numberOfOrdersSingle({ onValue, initialValue, placeholder }: FilterComponentType)}
	<Input
		size="xs"
		type="number"
		min="0"
		value={initialValue as string}
		onchange={(evt) => onValue(parseInt((evt.target as HTMLInputElement).value))}
		{placeholder}
	/>
{/snippet}

{#snippet numberOfOrdersBetween({ onValue, initialValue }: FilterComponentType)}
	{@const range = (initialValue || []) as number[]}
	<div class="flex flex-col gap-1">
		{@render numberOfOrdersSingle({
			onValue: (value) => {
				range[0] = value as number;
				onValue(range);
			},
			initialValue: range[0],
			placeholder: 'From'
		})}
		{@render numberOfOrdersSingle({
			onValue: (value) => {
				range[1] = value as number;
				onValue(range);
			},
			initialValue: range[1],
			placeholder: 'To'
		})}
	</div>
{/snippet}

<FilterButton filterOptions={FILTER_OPTIONS} onApply={handleApply} />
