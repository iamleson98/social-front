<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		dropdownResizeDebounce,
		type DropdownProps
	} from './types';
	import { computePosition, offset, shift, flip } from '@floating-ui/dom';
	import { clickOutside } from '$lib/actions/click-outside';
	import { fly } from 'svelte/transition';
	import MenuItem from './menuItem.svelte';

	let {
		trigger,
		options,
		placement = 'bottom',
		children,
		noReCalculateOnWindowResize = false,
		open = $bindable(false)
	}: DropdownProps = $props();

	if ((options?.length && children) || (!options?.length && !children)) {
		throw new Error('Dropdown must have either options or children, not both');
	}

	let menuElemRef = $state<HTMLElement>();
	let triggerRef = $state<HTMLElement>();

	const computeStyle = async () => {
		if (!triggerRef || !menuElemRef) return;
		const { x, y } = await computePosition(triggerRef, menuElemRef, {
			placement,
			middleware: [offset(4), flip(), shift()]
		});

		Object.assign(menuElemRef.style || {}, {
			left: `${x}px`,
			top: `${y}px`
		});
	};

	const handleTriggerClick = async () => {
		open = true;
		await tick();
		computeStyle();
	};

	onMount(() => {
		if (!noReCalculateOnWindowResize)
			return dropdownResizeDebounce(window, { onFire: computeStyle });
	});
</script>

<div bind:this={triggerRef} class="relative inline-block">
	{@render trigger({ onclick: handleTriggerClick, onfocus: handleTriggerClick })}
	<div class="absolute z-100 min-w-full" bind:this={menuElemRef}>
		{#if open}
			<div
				use:clickOutside={{ onOutclick: () => (open = false) }}
				transition:fly={{ y: 10 }}
				class="py-2 rounded-lg border border-gray-200 bg-white shadow-xs"
				onclick={computeStyle}
				onkeyup={(e) => e.key === 'Escape' && (open = false)}
				role="menu"
				tabindex="-1"
			>
				{#if options?.length}
					{#each options as option, idx (idx)}
						{@const { onclick, ...rest } = option}
						<MenuItem
							{...rest}
							onclick={() => {
								onclick?.();
								open = false;
							}}
						/>
					{/each}
				{:else if children}
					{@render children()}
				{/if}
			</div>
		{/if}
	</div>
</div>
