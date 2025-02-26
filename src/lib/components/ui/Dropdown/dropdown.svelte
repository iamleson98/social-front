<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import {
		dropdownResizeDebounce,
		type DropdownTriggerInterface,
		type MenuItemProps
	} from './types';
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
		open?: boolean;
	};

	let {
		trigger,
		options,
		placement = 'bottom',
		children,
		noReCalculateOnWindowResize = false,
		open = $bindable(false)
	}: Props = $props();

	if ((options?.length && children) || (!options?.length && !children)) {
		throw new Error('Dropdown must have either options or children, not both');
	}

	let menuElemRef = $state<HTMLElement>();
	let triggerRef = $state<HTMLElement>();

	const computeStyle = async () => {
		const { x, y } = await computePosition(triggerRef!, menuElemRef!, {
			placement,
			middleware: [offset(4), flip(), shift()]
		});

		Object.assign(menuElemRef!.style, {
			left: `${x}px`,
			top: `${y}px`
		});
	};

	const handleTriggerClick = async () => {
		open = true;
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
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				use:clickOutside={{ onOutclick: () => (open = false) }}
				transition:fly={{ y: 10 }}
				class="py-2 rounded-lg border border-gray-200 bg-white shadow-xs"
				onclick={computeStyle}
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
</div>
