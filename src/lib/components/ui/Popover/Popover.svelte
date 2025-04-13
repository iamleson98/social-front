<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import { computePosition, offset, shift, flip, type Placement } from '@floating-ui/dom';
	import { clickOutside } from '$lib/actions/click-outside';
	import { fly } from 'svelte/transition';
	import { dropdownResizeDebounce, type DropdownTriggerInterface } from '../Dropdown';

	type Props = {
		/** NOTE: children and options must be provided exclusively */
		// options?: MenuItemProps[];
		trigger: Snippet<[DropdownTriggerInterface]>;
		placement?: Placement;
		/** NOTE: children and options must be provided exclusively */
		children: Snippet;
		/** if `true`, will not recalculate position on window resize nor scroll */
		noReCalculateOnWindowResize?: boolean;
		open?: boolean;
	};

	let {
		trigger,
		placement = 'bottom',
		children,
		noReCalculateOnWindowResize = false,
		open = $bindable(false)
	}: Props = $props();

	let menuElemRef = $state<HTMLElement>();
	let triggerRef = $state<HTMLElement>();

	let flyOpts = $derived.by(() => {
		switch (placement) {
			case 'left':
			case 'right':
			case 'left-end':
			case 'right-end':
			case 'left-start':
			case 'right-start':
				return { x: 10 };
			default:
				return { y: 10 };
		}
	});

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
			<!-- <div
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
			</div> -->
			<div
				use:clickOutside={{ onOutclick: () => (open = false) }}
				transition:fly={flyOpts}
				class="p-2 rounded-lg border border-gray-200 bg-white shadow-xs"
				onclick={computeStyle}
				onkeyup={(e) => e.key === 'Escape' && (open = false)}
				role="menu"
				tabindex="-1"
			>
				{@render children()}
			</div>
		{/if}
	</div>
</div>
