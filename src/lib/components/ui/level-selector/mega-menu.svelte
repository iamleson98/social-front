<script lang="ts">
	import type { SelectItemProps, MenuProps } from './types';
	import SingleMenu from './single-menu.svelte';
	import { BreadCrumb } from '$lib/components/ui/Breadcrumb';
	import { tick } from 'svelte';

	let { items, onSelect }: MenuProps = $props();

	let menuSectionsData = $state.raw<SelectItemProps[][]>([items]);
	let selectedItems = $state.raw<SelectItemProps[]>([]);

	const handleItemSelect = (level: number, item: SelectItemProps) => {
		menuSectionsData = menuSectionsData.slice(0, level + 1);
		if (item.children?.length) {
			tick().then(() => {
				menuSectionsData = [...menuSectionsData, item.children as SelectItemProps[]];
			});
		}

		selectedItems = [...selectedItems.slice(0, level), item];
		onSelect(item);
	};
</script>

<div>
	<div class="flex gap-2 flex-row w-full overflow-x-auto">
		{#each menuSectionsData as items, idx (idx)}
			<SingleMenu {items} onSelect={(item) => handleItemSelect(idx, item)} />
		{/each}
	</div>

	<BreadCrumb
		items={selectedItems.map((item) => ({ value: item.title }))}
		class="text-blue-600 p-2"
	/>
</div>
