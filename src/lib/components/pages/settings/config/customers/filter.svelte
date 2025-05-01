<script lang="ts">
	import FilterButton from '$lib/components/common/filter-box/filter-button.svelte';
	import type {
		FilterComponentType,
		FilterProps,
		SingleFilter
	} from '$lib/components/common/filter-box/types';
	import { EaseDatePicker } from '$lib/components/ui/EaseDatePicker';
	import { Input } from '$lib/components/ui/Input';

	const FILTER_OPTIONS: FilterProps[] = [
		{
			label: 'Join date',
			key: 'joinDate',
			operation: [
				{
					operator: 'lower',
					component: joinDateSingle
				},
				{
					operator: 'greater',
					component: joinDateSingle
				},
				{
					operator: 'between',
					component: joinDateBetween
				}
			]
		},
		{
			label: 'Number of orders',
			key: 'numberOfOrders',
			operation: [
				{
					operator: 'in',
					component: numberOfOrdersSingle
				},
				{
					operator: 'greater',
					component: numberOfOrdersSingle
				},
				{
					operator: 'lower',
					component: numberOfOrdersSingle
				},
				{
					operator: 'between',
					component: numberOfOrdersBetween
				}
			]
		}
	];

	let filters = $state<SingleFilter[]>([]);
</script>

{#snippet joinDateSingle({ onValue, initialValue }: FilterComponentType)}
	<EaseDatePicker
		size="xs"
		value={{ date: initialValue as string }}
		onchange={(value) => onValue(value.date as string)}
		placeholder="Enter join date"
		timeConfig={false}
		autoApply={false}
	/>
{/snippet}

{#snippet joinDateBetween({ onValue, initialValue }: FilterComponentType)}
	{@const range = (initialValue || ['', '']) as string[]}
	<div class="flex flex-col gap-1">
		<EaseDatePicker
			size="xs"
			value={{ date: range[0] }}
			onchange={(value) => {
				range[0] = value.date as string;
				onValue(range);
			}}
			placeholder="Start date"
			timeConfig={false}
			autoApply={false}
		/>
		<EaseDatePicker
			size="xs"
			value={{ date: range[1] }}
			onchange={(value) => {
				range[1] = value.date as string;
				onValue(range);
			}}
			placeholder="End date"
			timeConfig={false}
			autoApply={false}
		/>
	</div>
{/snippet}

{#snippet numberOfOrdersSingle({ onValue, initialValue }: FilterComponentType)}
	<Input
		size="xs"
		type="number"
		min="0"
		value={initialValue as string}
		onchange={(evt) => onValue((evt.target as HTMLInputElement).value)}
		placeholder="Enter number"
	/>
{/snippet}

{#snippet numberOfOrdersBetween({ onValue, initialValue }: FilterComponentType)}
	{@const range = (initialValue || ['', '']) as string[]}
	<div class="flex flex-col gap-1">
		<Input
			size="xs"
			type="number"
			min="0"
			value={range[0]}
			onchange={(evt) => {
				range[0] = (evt.target as HTMLInputElement).value;
				onValue(range);
			}}
			placeholder="From"
		/>
		<Input
			size="xs"
			type="number"
			min="1"
			value={range[1]}
			onchange={(evt) => {
				range[1] = (evt.target as HTMLInputElement).value;
				onValue(range);
			}}
			placeholder="To"
		/>
	</div>
{/snippet}

<FilterButton filterOptions={FILTER_OPTIONS} onApply={(flts) => (filters = flts)} />
