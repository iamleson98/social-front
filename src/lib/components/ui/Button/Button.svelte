<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { SocialColor, SocialRadius, SocialSize } from '../common';
	import { buttonVariantColorsMap, type ButtonVariant } from './button.types';
	import { type Snippet } from 'svelte';
	import { Icon, type IconType } from '$lib/components/icons';

	type Props = {
		variant?: ButtonVariant;
		ref?: HTMLButtonElement;
		type?: 'button' | 'submit' | 'reset';
		color?: SocialColor;
		upper?: boolean;
		size?: SocialSize;
		radius?: SocialRadius;
		loading?: boolean;
		fullWidth?: boolean;
		children: Snippet;
		startIcon?: IconType;
		endIcon?: IconType;
	} & HTMLButtonAttributes;

	type IconProps = {
		icon?: IconType;
		pos: 'start' | 'end';
	};

	let {
		variant = 'filled',
		ref = $bindable(),
		type = 'button',
		color = 'blue',
		upper = false,
		size = 'md',
		radius = 'rounded-md',
		class: className = '',
		loading = false,
		disabled = false,
		fullWidth = false,
		children,
		startIcon,
		endIcon,
		...restProps
	}: Props = $props();
</script>

{#snippet buttonIcon({ icon, pos }: IconProps)}
	{#if icon}
		<span class={`text-xl ${pos === 'start' ? 'mr-2' : 'ml-2'}`}>
			<Icon {icon} />
		</span>
	{/if}
{/snippet}

<button
	class={`${buttonVariantColorsMap[variant][color]} button button-${size} ${radius} ${className}`}
	class:uppercase={upper}
	class:w-full={fullWidth}
	{type}
	{disabled}
	bind:this={ref}
	{...restProps}
>
	{#if loading}
		<span class="loading loading-dots loading-sm"></span>
	{:else}
		{@render buttonIcon({ icon: startIcon, pos: 'start' })}
		{@render children()}
		{@render buttonIcon({ icon: endIcon, pos: 'end' })}
	{/if}
</button>

<style lang="postcss">
	.button {
		@apply cursor-pointer relative outline-none select-none appearance-none text-center inline-flex justify-center items-center leading-none grow-0 font-medium focus:ring-4;
		-webkit-tap-highlight-color: transparent;
	}
	.button:disabled,
	button:disabled {
		@apply text-gray-400 bg-gray-200 !cursor-not-allowed !select-none !pointer-events-none !touch-none;
	}
	.button-xs {
		@apply text-xs h-6 min-h-6 px-2;
	}
	.button-sm {
		@apply h-8 min-h-8 px-3 text-sm;
	}
	.button-md {
		@apply text-base h-12 min-h-12 px-4;
	}
	.button-lg {
		@apply h-14 min-h-14 px-6 text-lg;
	}
	.button-xl {
		@apply px-7 text-xl h-16 min-h-16;
	}
</style>
