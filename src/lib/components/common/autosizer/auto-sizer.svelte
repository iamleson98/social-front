<script lang="ts">
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { createDetectElementResize } from './detectElementResize.js';

	type Props = {
		onResize?: ({ height, width }: { height: number; width: number }) => void;
		disableHeight?: boolean;
		disableWidth?: boolean;
		class?: string;
		defaultHeight?: number;
		defaultWidth?: number;
		nonce?: string;
		children: Snippet;
		ref: HTMLDivElement;
	};

	let {
		onResize = () => {},
		disableHeight = false,
		disableWidth = false,
		class: className = '',
		defaultHeight,
		defaultWidth,
		nonce,
		children,
		ref = $bindable(),
	}: Props = $props();

	let height = $state(defaultHeight || 0);
	let width = $state(defaultWidth || 0);
	let parentNode = $state<HTMLElement>();
	let autoSizer = $state<HTMLDivElement>();
	let detectElementResize = $state<any>();
	let childParams = $state<{ height?: number; width?: number }>({});
	// Avoid rendering children before the initial measurements have been collected.
	// At best this would just be wasting cycles.
	let bailoutOnChildren = $state(false);
	let outerstylewidth = $state(false);
	let outerstyleheight = $state(false);

	const _onResize = () => {
		if (parentNode) {
			// Guard against AutoSizer component being removed from the DOM immediately after being added.
			// This can result in invalid style values which can result in NaN values if we don't handle them.
			// See issue #150 for more context.

			const height_ = parentNode.offsetHeight || 0;
			const width_ = parentNode.offsetWidth || 0;

			const style = window.getComputedStyle(parentNode) || {};
			const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
			const paddingRight = parseInt(style.paddingRight, 10) || 0;
			const paddingTop = parseInt(style.paddingTop, 10) || 0;
			const paddingBottom = parseInt(style.paddingBottom, 10) || 0;

			const newHeight = height_ - paddingTop - paddingBottom;
			const newWidth = width_ - paddingLeft - paddingRight;

			if ((!disableHeight && height !== newHeight) || (!disableWidth && width !== newWidth)) {
				height = height_ - paddingTop - paddingBottom;
				width = width_ - paddingLeft - paddingRight;

				onResize({ height, width });
			}
		}
	};

	onMount(() => {
		if (
			autoSizer &&
			autoSizer.parentNode &&
			autoSizer.parentNode.ownerDocument &&
			autoSizer.parentNode.ownerDocument.defaultView &&
			autoSizer.parentNode instanceof autoSizer.parentNode.ownerDocument.defaultView.HTMLElement
		) {
			// Delay access of parentNode until mount.
			// This handles edge-cases where the component has already been unmounted before its ref has been set,
			// As well as libraries like react-lite which have a slightly different lifecycle.
			parentNode = autoSizer.parentNode;

			// Defer requiring resize handler in order to support server-side rendering.
			// See issue #41
			detectElementResize = createDetectElementResize(nonce);
			detectElementResize.addResizeListener(parentNode, _onResize);

			_onResize();
		}
	});

	onDestroy(() => {
		if (detectElementResize && parentNode) {
			detectElementResize.removeResizeListener(parentNode, _onResize);
		}
	});

	$effect(() => {
		bailoutOnChildren = false;
		if (!disableHeight) {
			if (height === 0) {
				bailoutOnChildren = true;
			}
			outerstyleheight = true;
			childParams.height = height;
		}

		if (!disableWidth) {
			if (width === 0) {
				bailoutOnChildren = true;
			}
			outerstylewidth = true;
			childParams.width = width;
		}
	});
</script>

<div
	class={[className, outerstylewidth && 'w-0', outerstyleheight && 'h-0', 'overflow-visible']}
	bind:this={autoSizer}
>
	{#if !bailoutOnChildren}
		<div style="width: {childParams.width}px; height: {childParams.height}px" bind:this={ref}>
			{@render children()}
		</div>
	{/if}
</div>
