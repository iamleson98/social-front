<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { dropdownResizeDebounce, type DropdownTriggerInterface, type MenuItemProps } from './types';
	import { computePosition, offset, shift, flip, type Placement } from '@floating-ui/dom';
	import { clickOutside } from '$lib/actions/click-outside';
	import { fly } from 'svelte/transition';
	import MenuItem from './menuItem.svelte';

	type Props = {
		options?: MenuItemProps[];
		trigger: Snippet<[DropdownTriggerInterface]>;
		placement?: Placement;
		children?: Snippet;
		/** if `true`, will not recalculate position on window resize nor scroll */
		noReCalculateOnWindowResize?: boolean;
	};

	let {
		trigger,
		options,
		placement = 'bottom',
		children,
		noReCalculateOnWindowResize = false
	}: Props = $props();

	if ((options?.length && children) || (!options?.length && !children)) {
		throw new Error('Dropdown must have either options or children, not both');
	}

	let openMenu = $state(false);
	let menuElemRef = $state<HTMLElement>();
	let triggerRef = $state<HTMLElement>();

	const computeStyle = async () => {
		if (!triggerRef || !menuElemRef || !openMenu) return;

		const { x, y } = await computePosition(triggerRef, menuElemRef, {
			placement,
			middleware: [offset(6), flip(), shift()]
		});

		Object.assign(menuElemRef.style, {
			left: `${x}px`,
			top: `${y}px`
		});
	};

	const handleTriggerClick = async () => {
		openMenu = true;
		computeStyle();
	};

	onMount(() => {
		if (noReCalculateOnWindowResize) return;
		return dropdownResizeDebounce(window, { onFire: computeStyle });
	});
</script>

<div bind:this={triggerRef} class="relative inline-block">
	{@render trigger({ onclick: handleTriggerClick, onfocus: handleTriggerClick })}

	{#if openMenu}
		<div
			use:clickOutside={{ onOutclick: () => (openMenu = false) }}
			transition:fly={{ y: 10 }}
			bind:this={menuElemRef}
			class="absolute z-500 py-2 rounded-lg border border-gray-200 bg-white min-w-full shadow-xs"
		>
			{#if options?.length}
				{#each options as option, idx (idx)}
					<MenuItem {...option} />
				{/each}
			{:else}
				{@render children?.()}
			{/if}
		</div>
	{/if}
</div>
