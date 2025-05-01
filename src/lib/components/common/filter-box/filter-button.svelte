<script lang="ts">
	import FilterBox from '$lib/components/common/filter-box/filter-box.svelte';
	import type { FilterProps, SingleFilter } from '$lib/components/common/filter-box/types';
	import { FilterCog } from '$lib/components/icons';
	import { Button } from '$lib/components/ui';
	import type { SocialSize } from '$lib/components/ui/common';
	import { type DropdownTriggerInterface } from '$lib/components/ui/Dropdown';
	import { Popover } from '$lib/components/ui/Popover';

	type Props = {
		filterOptions: FilterProps[];
		size?: SocialSize;
		onApply?: (filters: SingleFilter[]) => void;
	};

	let { filterOptions, size = 'sm', onApply }: Props = $props();

	let isFilterOpening = $state(false);

	let filters = $state<SingleFilter[]>([]);
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
		{onApply}
		bind:filters
		class="min-w-96 border border-gray-200"
		onClose={() => (isFilterOpening = false)}
	/>
</Popover>
