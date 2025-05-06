<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { computePosition, offset, shift, flip, type Placement } from '@floating-ui/dom';
	import { clickOutside } from '$lib/actions/click-outside';
	import { mouseLeave } from '$lib/actions/mouse-leave';
	import { fly, type FlyParams } from 'svelte/transition';
	import { dropdownResizeDebounce, type DropdownTriggerInterface } from './types';

	type CloseByType = 'click-out' | 'mouse-leave';

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
		/**whether to close your popover by click outside or leave your mouse*/
		closeBy?: CloseByType;
	};

	let {
		trigger,
		placement = 'bottom',
		children,
		noReCalculateOnWindowResize = false,
		open = $bindable(false),
		closeBy = 'click-out'
	}: Props = $props();

	let menuElemRef = $state<HTMLElement>();
	let triggerRef = $state<HTMLElement>();

	let flyOpts = $derived.by<FlyParams>(() => {
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

		Object.assign(menuElemRef.style, {
			left: `${x}px`,
			top: `${y}px`
		});
	};

	const handleTriggerClick = async () => {
		open = true;
		await computeStyle();
	};

	onMount(() => {
		if (!noReCalculateOnWindowResize)
			return dropdownResizeDebounce(window, { onFire: computeStyle });
	});

	const handleUnFocus = (type: CloseByType) => {
		open = type !== closeBy;
	};
</script>

<div
	bind:this={triggerRef}
	class="relative inline-block"
	use:mouseLeave={{ onMouseLeave: () => handleUnFocus('mouse-leave') }}
>
	{@render trigger({ onclick: handleTriggerClick, onfocus: handleTriggerClick })}
	<div class="absolute z-100 min-w-full" bind:this={menuElemRef}>
		{#if open}
			<div
				use:clickOutside={{ onOutclick: () => handleUnFocus('click-out') }}
				transition:fly={flyOpts}
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
