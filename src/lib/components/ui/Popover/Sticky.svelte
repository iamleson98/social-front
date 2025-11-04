<script lang="ts">
	import { clickOutside } from '$lib/actions/click-outside';
	import { elementResizeObserver } from './types';
	import { computePosition, flip, offset, shift, type Placement, size } from '@floating-ui/dom';
	import { type Snippet } from 'svelte';
	import { fly, type FlyParams } from 'svelte/transition';

	type Props = {
		children: Snippet;
		/** Target element to stick to. Will show if provided */
		target?: HTMLElement;
		placement?: Placement;
		/** to control the z-index level of your component. Default to `10000` */
		zIndex?: number;
	};

	let { children, target = $bindable(), placement = 'bottom', zIndex = 10000 }: Props = $props();

	let ContainerRef = $state<HTMLElement>();
	let flyOpts = $derived<FlyParams>(/(left|right)/.test(placement) ? { x: 10 } : { y: 10 });

	const computeStyle = async () => {
		if (!ContainerRef || !target) return;
		const { x, y } = await computePosition(target, ContainerRef, {
			placement,
			strategy: 'fixed',
			middleware: [
				offset(4),
				flip(),
				shift(),
				size({
					apply: ({ rects, elements }) => {
						elements.floating.style.width = `${rects.reference.width}px`;
					},
				}),
			],
		});

		ContainerRef.style.left = `${x}px`;
		ContainerRef.style.top = `${y}px`;
	};

	$effect(() => {
		if (target) computeStyle();
	});

	const handleInnerClose = (evt: Event) => {
		if (
			(evt instanceof KeyboardEvent && evt.key === 'Escape') ||
			(target && evt instanceof MouseEvent && evt.target !== target)
		)
			target = undefined;
	};
</script>

<svelte:window use:elementResizeObserver={{ onFire: computeStyle }} />

<div
	class="fixed! inline-block min-w-fit!"
	style:z-index={zIndex}
	bind:this={ContainerRef}
	use:clickOutside={{ onOutclick: handleInnerClose }}
	onkeyup={(e) => e.key === 'Escape' && handleInnerClose(e)}
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
	It is different from Popover in that it opens whenever the target prop is provided.

	The way it works:

	In some places where overflow-x/y is set to `auto` or `scroll`, using just `Popover` does not work.
	This component solves that by using floating-ui to calculate position. Fixed css position makes it can be anywhere without being affected by overflow-x/y.
 -->
