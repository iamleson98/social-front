<script lang="ts">
	import { Icon, type IconType } from '$lib/components/icons';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { SocialColor, SocialSize } from '../common';
	import { buttonVariantColorsMap, type ButtonVariant } from './button.types';
	import type { Snippet } from 'svelte';

	type Props = {
		size?: SocialSize;
		color?: SocialColor;
		variant?: ButtonVariant;
		icon: IconType;
		children?: Snippet;
		ref?: HTMLButtonElement | null;
		/** default `square` */
		shape?: 'square' | 'circle';
	} & HTMLButtonAttributes;

	let {
		size = 'md',
		color = 'blue',
		variant = 'filled',
		class: className = $bindable(''),
		icon,
		ref = $bindable(),
		shape = 'square',
		children,
		...rest
	}: Props = $props();
</script>

<button
	class={`icon-btn icon-btn-${size} ${buttonVariantColorsMap[variant][color]} ${className} ${shape === 'square' ? 'rounded-md' : 'rounded-full'}`}
	bind:this={ref}
	{...rest}
>
	<Icon {icon} />
	{#if children}
		{@render children()}
	{/if}
</button>

<style lang="postcss">
	.icon-btn {
		@apply inline-flex items-center justify-center cursor-pointer focus:ring-4;
	}
	.icon-btn-xs {
		@apply text-xs h-6 w-6;
	}
	.icon-btn-sm {
		@apply text-sm h-8 w-8;
	}
	.icon-btn-md {
		@apply text-base h-12 w-12;
	}
	.icon-btn-lg {
		@apply text-lg h-14 w-14;
	}
	.icon-btn-xl {
		@apply text-xl h-16 w-16;
	}
</style>
