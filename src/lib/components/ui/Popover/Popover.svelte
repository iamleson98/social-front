<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { dropdownResizeDebounce, type DropdownTriggerInterface } from './types';
	import { computePosition, offset, shift, flip, type Placement } from '@floating-ui/dom';
	import { onMount, tick, type Snippet } from 'svelte';
	import { fly, type FlyParams } from 'svelte/transition';

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
		open = $bindable(false),
	}: Props = $props();

	let menuElemRef = $state<HTMLElement>();
	let triggerRef = $state<HTMLElement>();

	let flyOpts = $derived<FlyParams>(/(left|right)/.test(placement) ? { x: 10 } : { y: 10 });

	const computeStyle = async () => {
		if (!triggerRef || !menuElemRef) return;
		const { x, y } = await computePosition(triggerRef, menuElemRef, {
			placement,
			middleware: [offset(4), flip(), shift()],
		});

		menuElemRef.style.left = `${x}px`;
		menuElemRef.style.top = `${y}px`;
	};

	const handleTriggerClick = async () => {
		open = true;
		await tick();
		await computeStyle();
	};

	onMount(() => {
		if (!noReCalculateOnWindowResize)
			return dropdownResizeDebounce(window, { onFire: computeStyle });
	});
</script>

<div
	bind:this={triggerRef}
	class="relative inline-block"
	use:clickOutside={{ onOutclick: () => (open = false) }}
	onkeyup={(e) => e.key === 'Escape' && (open = false)}
	role="menu"
	tabindex="-1"
>
	{@render trigger({
		onclick: handleTriggerClick,
		onfocus: handleTriggerClick,
		onclose: () => (open = false),
	})}
	<div class="absolute z-100 min-w-full" bind:this={menuElemRef}>
		{#if open}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div transition:fly={flyOpts}>
				{@render children()}
			</div>
		{/if}
	</div>
</div>
