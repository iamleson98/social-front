<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { SocialColor, SocialRadius, SocialSize } from '../common';
	import { buttonVariantColorsMap, type ButtonVariant } from './button.types';
	import type { Snippet } from 'svelte';
	import { Icon, type IconType } from '$lib/components/icons';

	type Props = {
		variant?: ButtonVariant;
		ref?: HTMLButtonElement | null;
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
		ref = null,
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
	class={`${buttonVariantColorsMap[variant][color]} btn btn-${size} ${radius} ${className}`}
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
	.btn {
		@apply cursor-pointer relative outline-none select-none appearance-none text-center flex justify-center items-center leading-none grow-0 font-medium focus:ring-4;
		-webkit-tap-highlight-color: transparent;
	}
	.btn:disabled,
	button:disabled {
		@apply text-gray-400 bg-gray-200 !cursor-not-allowed !select-none !pointer-events-none !touch-none;
	}
	.btn-xs {
		@apply px-3 py-2 text-xs;
	}
	.btn-sm {
		@apply h-9 py-0 px-[18px] text-sm;
	}
	.btn-md {
		@apply h-[42px] py-0 px-[22px] text-base;
	}
	.btn-lg {
		@apply h-[50px] py-0 px-[26px] text-lg;
	}
	.btn-xl {
		@apply h-[60px] py-0 px-8 text-xl;
	}
</style>
