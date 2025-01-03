<!-- <script lang="ts">
	import { Icon } from '$lib/components/icons';
	import type { DropDownMenuProps } from './types';
	import { flip, shift, offset, autoUpdate, useFloating } from '@skeletonlabs/floating-ui-svelte';

	let { trigger, selectItems, onSelect }: DropDownMenuProps = $props();
	let openMenu = $state(false);

	const floating = useFloating({
		middleware: [shift({ padding: 10 }), flip(), offset(8)],
		placement: 'bottom-start',
		strategy: 'absolute',
		whileElementsMounted: autoUpdate
	});

	const handleOpenMenu = (open: boolean) => {
		openMenu = open;
	};

	const handleSelect = (itemIdx: number) => {
		onSelect(selectItems[itemIdx]);
		handleOpenMenu(false);
	};
</script>

<div class="relative inline-block">
	<div bind:this={floating.elements.reference} class="relative z-20">
		{@render trigger({ onclick: () => handleOpenMenu(true) })}
	</div>

	{#if openMenu}
		<div
			bind:this={floating.elements.floating}
			style={floating.floatingStyles}
			class="absolute bg-white border border-gray-200 rounded shadow-lg z-10 w-56"
		>
			{#each selectItems as item, idx (idx)}
				<div
					class="flex items-center gap-1 px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
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

<style></style> -->

<script lang="ts">
	import { computePosition, offset, flip, shift } from '@floating-ui/dom';
	import { onMount, onDestroy } from 'svelte';
	import type { DropDownMenuProps } from './types';
	import Icon from '$lib/components/icons/icon.svelte';

	let openMenu = $state(false);
	let reference: HTMLElement | null = null;
	let floating: HTMLElement | null = null;

	let { trigger, selectItems, onSelect }: DropDownMenuProps = $props();

	const positionFloating = async () => {
		if (reference && floating) {
			const { x, y } = await computePosition(reference, floating, {
				placement: 'bottom-start',
				middleware: [offset(8), flip(), shift({ padding: 5 })]
			});

			Object.assign(floating.style, {
				left: `${x}px`,
				top: `${y}px`,
				position: 'absolute',
				visibility: 'visible'
			});
		}
	};

	const handleOpenMenu = async () => {
		openMenu = !openMenu;

		if (openMenu) {
			await positionFloating();
		} else if (floating) {
			floating.style.visibility = 'hidden';
		}
	};

	const updatePosition = () => {
		if (openMenu) {
			positionFloating();
		}
	};

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', updatePosition);
			window.addEventListener('scroll', updatePosition);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition);
		}
	});

	const handleSelect = (itemIdx: number) => {
		onSelect(selectItems[itemIdx]);
	};
</script>

<div class="relative inline-block">
	<div bind:this={reference} class="relative z-20">
		{@render trigger({ onclick: () => handleOpenMenu() })}
	</div>

	<div
		class="bg-white border border-gray-200 rounded shadow-lg w-56"
		bind:this={floating}
		style="visibility: hidden;"
	>
		<ul>
			{#each selectItems as item, idx (idx)}
				<div
					class="flex items-center gap-1 px-4 py-2 cursor-pointer hover:bg-blue-500 hover:text-white"
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
		</ul>
	</div>
</div>
