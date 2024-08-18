<script lang="ts">
	import { Icon, type IconType } from '$lib/components/icons';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { SocialColor, SocialSize } from '../common';
	import { buttonVariantColorsMap, type ButtonVariant } from './button.types';

	type Props = {
		size?: SocialSize;
		color?: SocialColor;
		variant?: ButtonVariant;
		class?: string;
		icon: IconType;
		ref?: HTMLButtonElement | null;
		shape?: 'square' | 'circle';
	} & HTMLButtonAttributes;

	let {
		size = 'md',
		color = 'blue',
		variant = 'filled',
		class: className = '',
		icon,
		ref,
		shape = 'square',
		...rest
	}: Props = $props();
</script>

<button
	class={`icon-btn icon-btn-${size} ${buttonVariantColorsMap[variant][color]} ${className} ${shape === 'square' ? 'rounded-md' : 'rounded-full'}`}
	bind:this={ref}
	{...rest}
>
	<Icon {icon} />
</button>

<style lang="postcss">
	.icon-btn {
		@apply inline-flex items-center justify-center cursor-pointer focus:ring-4;
	}
	.icon-btn-xs {
		@apply p-1 text-xs;
	}
	.icon-btn-sm {
		@apply p-1.5 text-sm;
	}
	.icon-btn-md {
		@apply p-3 text-base;
	}
	.icon-btn-lg {
		@apply p-4 text-lg;
	}
	.icon-btn-xl {
		@apply p-5 text-xl;
	}
</style>
