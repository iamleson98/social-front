<script lang="ts">
	import type { SelectItemProps, MenuProps } from './types';
	import SingleMenu from './single-menu.svelte';
	import { BreadCrumb } from '$lib/components/ui/Breadcrumb';
	import { tick } from 'svelte';
	import { Checkbox } from '../Input';

	let { items, onSelect, onDeselect, onSelectWhole }: MenuProps = $props();

	let menuSectionsData = $state.raw<SelectItemProps[][]>([items]);
	let selectedItems = $state.raw<SelectItemProps[]>([]);
	let checked = $state<boolean>();

	const handleItemSelect = (level: number, item: SelectItemProps) => {
		menuSectionsData = menuSectionsData.slice(0, level + 1);
		if (item.children?.length) {
			tick().then(() => {
				menuSectionsData = [...menuSectionsData, item.children as SelectItemProps[]];
			});
		}

		selectedItems = [...selectedItems.slice(0, level), item];
	};

	$effect(() => {
		if (checked) {
			onSelect?.(selectedItems[selectedItems.length - 1]);
			onSelectWhole?.(selectedItems);
		} else if (checked === false) onDeselect?.();
	});
</script>

<div>
	<div class="flex gap-2 flex-row w-full overflow-x-auto">
		{#each menuSectionsData as items, idx (idx)}
			<SingleMenu {items} onSelect={(item) => handleItemSelect(idx, item)} disabled={checked} />
		{/each}
	</div>

	<div class="flex items-center gap-2 p-2">
		<BreadCrumb
			items={selectedItems.map((item) => ({ value: item.title }))}
			class="text-blue-600 text-sm"
		/>

		{#if selectedItems.length && !selectedItems[selectedItems.length - 1].children?.length}
			<Checkbox bind:checked title="Select this item" size="sm" />
		{/if}
	</div>
</div>
