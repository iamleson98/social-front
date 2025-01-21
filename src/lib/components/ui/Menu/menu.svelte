<script lang="ts">
	import { computePosition, flip, shift, offset, type Placement } from '@floating-ui/dom';
	import type { Snippet } from 'svelte';
	import type { EventHandler } from 'svelte/elements';
	import { onDestroy } from 'svelte';

	type Props = {
		trigger: Snippet<[TriggerIface]>;
		children: Snippet;
		placementOption?: Placement;
	};

	let { trigger, children, placementOption }: Props = $props();
	let openMenu = $state(false);

	type TriggerIface = {
		onclick: EventHandler;
	};

	let triggerRef: HTMLElement;
	let menuRef: HTMLElement;

	const updatePosition = async () => {
		if (triggerRef && menuRef) {
			const { x, y } = await computePosition(triggerRef, menuRef, {
				placement: placementOption,
				middleware: [offset(8), flip(), shift()]
			});
			Object.assign(menuRef.style, {
				left: `${x}px`,
				top: `${y}px`,
				position: 'absolute'
			});
		}
	};

	const menuAction = (node: HTMLElement) => {
		menuRef = node;
		updatePosition();
	};

	const handleClick = async () => {
		openMenu = !openMenu;

		if (openMenu) {
			window.addEventListener('scroll', updatePosition);
			window.addEventListener('resize', updatePosition);
			window.addEventListener('click', handleClickOutside);
		} else {
			window.removeEventListener('scroll', updatePosition);
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('click', handleClickOutside);
		}
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (!menuRef || !triggerRef) return;
		
		const target = event.target as Node;
		if (!menuRef.contains(target) && !triggerRef.contains(target)) {
			openMenu = false;
			window.removeEventListener('click', handleClickOutside);
		}
	};

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', updatePosition);
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div>
	<div bind:this={triggerRef}>
		{@render trigger({ onclick: handleClick })}
	</div>

	{#if openMenu}
		<div use:menuAction class="absolute z-500">
			{@render children()}
		</div>
	{/if}
</div>
