<script lang="ts" module>
	export enum RenderStrategy {
		Unmount,
		Hidden
	}
</script>

<script lang="ts">
	import { useActions, type HTMLActionArray } from '$lib/actions/use-actions';

	import type { SupportedAs } from '$lib/utils';
	import { Features } from '$lib/utils/types';
	import type { Snippet } from 'svelte';

	type Props = {
		as: SupportedAs;
		el?: HTMLElement;
		use?: HTMLActionArray;
		visible?: boolean;
		class?: string;
		isStatic?: boolean;
		features?: Features;
		unmount?: boolean;
		children: Snippet;
	};

	let {
		as,
		el,
		use = [],
		visible = true,
		class: className,
		isStatic = false,
		features = Features.None,
		unmount = true,
		children
	}: Props = $props();

	let show = $derived.by(
		() =>
			visible ||
			(features & Features.Static && isStatic) ||
			!(features & Features.RenderStrategy && unmount)
	);
	let hidden = $derived.by(
		() =>
			!!(
				!visible &&
				!(features & Features.Static && isStatic) &&
				features & Features.RenderStrategy &&
				!unmount
			)
	);
</script>

{#if show}
	{#if typeof as === 'string'}
		<svelte:element
			this={as}
			bind:this={el}
			use:useActions={use}
			class={`${className}`}
			class:!hidden={hidden}
			{hidden}
		>
			{@render children()}
		</svelte:element>
	{:else}
		{@render children()}
	{/if}
{/if}
