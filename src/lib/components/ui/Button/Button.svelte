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
		classes?: string;
		loading?: boolean;
		fullWidth?: boolean;
		children: Snippet;
		startIcon?: IconType;
		endIcon?: IconType;
	};

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
		classes = '',
		loading = $bindable(false),
		fullWidth = false,
		children,
		startIcon,
		endIcon,
		...restProps
	}: Props & HTMLButtonAttributes = $props();
</script>

{#snippet buttonIcon({ icon, pos }: IconProps)}
	{#if icon}
		<span class={`text-xl ${pos === 'start' ? 'mr-2' : 'ml-2'}`}>
			<Icon {icon} />
		</span>
	{/if}
{/snippet}

<button
	class={`${buttonVariantColorsMap[variant][color]} social-btn social-btn-${size} ${radius} ${classes}`}
	class:uppercase={upper}
	class:w-full={fullWidth}
	{type}
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
	.social-btn {
		@apply cursor-pointer relative outline-none select-none appearance-none text-center flex justify-center items-center leading-none grow-0 font-semibold active:scale-[.98];
		-webkit-tap-highlight-color: transparent;
	}
	.social-btn:disabled,
	button:disabled {
		@apply text-gray-400 bg-gray-200 !cursor-not-allowed !select-none !pointer-events-none !touch-none;
	}
	.social-btn-xs {
		@apply h-[30px] py-0 px-[14px] text-xs;
	}
	.social-btn-sm {
		@apply h-9 py-0 px-[18px] text-sm;
	}
	.social-btn-md {
		@apply h-[42px] py-0 px-[22px] text-base;
	}
	.social-btn-lg {
		@apply h-[50px] py-0 px-[26px] text-lg;
	}
	.social-btn-xl {
		@apply h-[60px] py-0 px-8 text-xl;
	}
</style>
