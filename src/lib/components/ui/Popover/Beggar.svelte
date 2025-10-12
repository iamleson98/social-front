<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { dropdownResizeDebounce } from './types';
	import { computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom';
	import type { Snippet } from 'svelte';
	import { fly, type FlyParams } from 'svelte/transition';

	type Props = {
		children: Snippet;
		/** Target element to stick to. Will show if provided */
		target?: HTMLElement;
		placement?: Placement;
	};

	let { children, target = $bindable(), placement = 'bottom' }: Props = $props();

	let ContainerRef = $state<HTMLElement>();
	let flyOpts = $derived<FlyParams>(/(left|right)/.test(placement) ? { x: 10 } : { y: 10 });

	const computeStyle = async () => {
		if (!ContainerRef || !target) return;
		const { x, y } = await computePosition(target, ContainerRef, {
			placement,
			strategy: 'fixed',
			middleware: [offset(4), flip(), shift()],
		});

		ContainerRef.style.left = `${x}px`;
		ContainerRef.style.top = `${y}px`;
	};

	$effect(() => {
		if (!!target) computeStyle();

		return dropdownResizeDebounce(window, { onFire: computeStyle });
	});
</script>

<div
	class="fixed! z-10000 inline-block"
	bind:this={ContainerRef}
	use:clickOutside={{ onOutclick: () => (target = undefined) }}
	onkeyup={(e) => e.key === 'Escape' && (target = undefined)}
	role="menu"
	tabindex="-1"
>
	{#if !!target}
		<div transition:fly={flyOpts}>
			{@render children()}
		</div>
	{/if}
</div>

<!-- @component
	This component behaves like Popover in that it sticks to provided target and auto calculates its position.
	It is different from Popover in that it does not have trigger and does not close when clicking outside.

	The way it works:

	In some places where overflow-x/y is set to auto or scroll, using just Popover does not work.
	This component solves that by using floating-ui to calculate position. Fixed css position makes it can be anywhere without being affected by overflow-x/y.
 -->
