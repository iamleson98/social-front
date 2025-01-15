<script lang="ts">
	import { computePosition, flip, shift, offset, type Placement } from '@floating-ui/dom';
	import type { Snippet } from 'svelte';
	import type { EventHandler } from 'svelte/elements';

	type Props = {
		trigger: Snippet<[TriggerIface]>;
		children: Snippet;
		placementOption?: Placement;
	};

	let { trigger, children, placementOption = 'bottom-start' }: Props = $props();
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
				top: `${y}px`
			});
		}
	};

	const handleClick = async () => {
		openMenu = !openMenu;

		if (openMenu) {
			window.addEventListener('scroll', updatePosition);
			window.addEventListener('resize', updatePosition);
		} else {
			window.removeEventListener('scroll', updatePosition);
			window.removeEventListener('resize', updatePosition);
		}
	};
</script>

<div>
	<div bind:this={triggerRef}>
		{@render trigger({ onclick: handleClick })}
	</div>

	{#if openMenu}
		<div bind:this={menuRef} style="position: absolute; z-index: 1000; mt-2">
			{@render children()}
		</div>
	{/if}
</div>
