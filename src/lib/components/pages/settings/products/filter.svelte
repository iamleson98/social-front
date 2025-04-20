<script lang="ts">
	import FilterBox from '$lib/components/common/filter-box/filter-box.svelte';
	import type { FilterProps } from '$lib/components/common/filter-box/types';
	import { Button } from '$lib/components/ui';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';
	import { Input } from '$lib/components/ui/Input';
	import { Popover } from '$lib/components/ui/Popover';

	const FILTER_OPTIONS: FilterProps[] = [
		{
			label: 'Price',
			key: 'price',
			operation: [
				{
					operator: 'is',
					component: priceIs
				}
			]
		}
	];

	let isFilterOpening = $state(false);
</script>

{#snippet trigger(opts: DropdownTriggerInterface)}
	<Button variant="light" color={isFilterOpening ? 'blue' : 'gray'} size="sm" {...opts}
		>Filters</Button
	>
{/snippet}

{#snippet priceIs({ onValue }: { onValue: (value: string[] | number[] | string | number) => void })}
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

<Popover {trigger} placement="bottom-start" bind:open={isFilterOpening}>
	<FilterBox header="Filters" options={FILTER_OPTIONS} class="min-w-96 border border-gray-200" />
</Popover>
