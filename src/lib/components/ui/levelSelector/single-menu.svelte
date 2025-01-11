<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { MenuProps } from './types';
	import { ChevronRight } from '$lib/components/icons';
	import Icon from '$lib/components/icons/icon.svelte';

	let { items, onSelect, disabled }: MenuProps = $props();

	let activeItemIndex = $state(-1);

	const handleItemSelect = (index: number) => {
		if (disabled) return;

		activeItemIndex = index;
		onSelect(items[index]);
	};
</script>

<div class="rounded-lg overflow-y-auto max-h-60 w-1/3 p-2">
	{#each items as item, idx (idx)}
		{@const colorClasses = activeItemIndex === idx ? 'bg-blue-50 ring-2 ring-blue-600' : 'ring-gray-200 ring-1 text-gray-700 bg-white'}
		{@const cursorClass = disabled ? 'cursor-not-allowed!' : 'cursor-pointer'}
		<div
			class={`flex items-center select-none justify-between overflow-hidden rounded-lg mb-2 font-medium p-2 ${cursorClass} ${colorClasses}`}
			role="button"
			tabindex="0"
			onclick={() => handleItemSelect(idx)}
			onkeydown={(evt) => evt.key === 'Enter' && handleItemSelect(idx)}
			aria-disabled={disabled}
		>
			<span>{item.title}</span>
			{#if activeItemIndex === idx}
				<span in:fly={{ x: -10 }}>
					<Icon icon={ChevronRight} />
				</span>
			{/if}
		</div>
	{/each}
</div>
