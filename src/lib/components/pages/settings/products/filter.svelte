<script lang="ts">
	import FilterBox from '$lib/components/common/filter-box/filter-box.svelte';
	import type { FilterProps, SingleFilter } from '$lib/components/common/filter-box/types';
	import { Button } from '$lib/components/ui';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';
	import { Input } from '$lib/components/ui/Input';
	import { Popover } from '$lib/components/ui/Popover';
	import { Select } from '$lib/components/ui/select';

	const FILTER_OPTIONS: FilterProps[] = [
		{
			label: 'Price',
			key: 'price',
			operation: [
				{
					operator: 'is',
					component: priceCmp
				},
				{
					operator: 'lower',
					component: priceCmp
				},
				{
					operator: 'greater',
					component: priceCmp
				},
				{
					operator: 'between',
					component: priceBetween
				}
			]
		},
		{
			label: 'Category',
			key: 'category',
			operation: [
				{
					operator: 'is',
					component: categoryIs
				}
			]
		}
	];

	let isFilterOpening = $state(false);

	let filters = $state<SingleFilter[]>([]);
</script>

{#snippet trigger(opts: DropdownTriggerInterface)}
	<Button
		variant="light"
		color={isFilterOpening ? 'blue' : 'gray'}
		size="sm"
		{...opts}
		class="indicator"
	>
		{#if filters.length}
			<span class="indicator-item badge badge-xs text-white! bg-blue-500">{filters.length}</span>
		{/if}
		Filters
	</Button>
{/snippet}

{#snippet priceCmp({
	onValue
}: {
	onValue: (value: string[] | number[] | string | number) => void;
})}
	<Input
		size="xs"
		placeholder="Enter price"
		type="number"
		min="0"
		inputDebounceOption={{
			onInput: (evt) => onValue(((evt as Event).target as HTMLInputElement).value)
		}}
	/>
{/snippet}

{#snippet priceBetween({
	onValue
}: {
	onValue: (value: string[] | number[] | string | number) => void;
})}
	{@const bounds = ['', '']}
	<div class="flex gap-1 flex-col">
		<Input
			size="xs"
			class="w-full"
			placeholder=">="
			type="number"
			min="0"
			inputDebounceOption={{
				onInput: (evt) => {
					bounds[0] = ((evt as Event).target as HTMLInputElement).value;
					onValue(bounds);
				}
			}}
		/>
		<Input
			size="xs"
			placeholder="<="
			class="w-full"
			type="number"
			min="0"
			inputDebounceOption={{
				onInput: (evt) => {
					bounds[1] = ((evt as Event).target as HTMLInputElement).value;
					onValue(bounds);
				}
			}}
		/>
	</div>
{/snippet}

{#snippet categoryIs({
	onValue
}: {
	onValue: (value: string[] | number[] | string | number) => void;
})}
	<Select options={[]} size="xs" />
{/snippet}

<Popover {trigger} placement="bottom-start" bind:open={isFilterOpening}>
	<FilterBox
		header="Filters"
		options={FILTER_OPTIONS}
		class="min-w-96 border border-gray-200"
		onApply={(fts) => (filters = fts)}
		onClose={() => (isFilterOpening = false)}
	/>
</Popover>
