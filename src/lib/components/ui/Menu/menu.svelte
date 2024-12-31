<script lang="ts">
	import { Icon } from '$lib/components/icons';
	import type { DropDownMenuProps } from './types';

	let { trigger, selectItems, onSelect }: DropDownMenuProps = $props();
	let openMenu = $state(false);

	// const handleClick = () => {
	// 	openMenu = !openMenu;
	// };

	const handleOpenMenu = (open: boolean) => openMenu = open;

	const handleSelect = (itemIdx: number) => {
		onSelect(selectItems[itemIdx])
		// handleClick();
		handleOpenMenu(false);
	};
</script>

<div>
	{@render trigger({ onclick: () => handleOpenMenu(true) })}

	{#if openMenu}
		<div class="absolute mt-1 rounded-lg">
			{#each selectItems as item, idx (idx)}
				<div class="flex items-center gap-1 py-1.5 px-3"
					role="button"
					onclick={() => handleSelect(idx)}
					tabindex="0"
					onkeyup={(e) => e.key === 'Enter' && handleSelect(idx)}
				>
					{#if item.startIcon}
						<Icon icon={item.startIcon} />
					{/if}
					<span>{item.label}</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
