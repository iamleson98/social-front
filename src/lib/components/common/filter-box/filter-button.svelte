<script lang="ts" generics="T">
	import FilterBox from './filter-box.svelte';
	import type {
		FilterConditions,
		FilterItemValue,
		FilterOperator,
		FilterProps,
		SingleFilter
	} from './types';
	import { FilterCog } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { SocialSize } from '$lib/components/ui/common';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';
	import { Popover } from '$lib/components/ui/Popover';

	type Props = {
		filterOptions: FilterProps<T>[];
		size?: SocialSize;
		onApply?: (conditions: FilterConditions<T>) => void;
	};

	let { filterOptions, size = 'sm', onApply }: Props = $props();

	let isFilterOpening = $state(false);

	let filters = $state<SingleFilter<T>[]>([]);

	const handleApply = () => {
		const conditions = filters.reduce<FilterConditions<T>>((acc, filter) => {
			if (!acc[filter.key]) {
				acc[filter.key] = {} as Record<FilterOperator, FilterItemValue>;
			}
			acc[filter.key][filter.operator] = filter.value as FilterItemValue;
			return acc;
		}, {} as FilterConditions<T>);

		onApply?.(conditions);
		isFilterOpening = false;
	};
</script>

{#snippet trigger(opts: DropdownTriggerInterface)}
	<Button variant="light" {size} {...opts} class="indicator" endIcon={FilterCog}>
		{#if filters.length}
			<span class="indicator-item badge badge-xs text-white! bg-blue-500">{filters.length}</span>
		{/if}
		Filters
	</Button>
{/snippet}

<Popover {trigger} placement="bottom-start" bind:open={isFilterOpening}>
	<FilterBox
		header="Filters"
		options={filterOptions}
		onApply={handleApply}
		bind:filters
		class="min-w-96 border border-gray-200"
		onClose={() => (isFilterOpening = false)}
	/>
</Popover>
