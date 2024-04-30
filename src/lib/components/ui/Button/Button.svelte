<script lang="ts">
	import type { SocialColor, SocialRadius, SocialSize } from '../common';
	import { buttonVariantColorsMap, type ButtonVariant } from './button.types';
	import { Spin } from '$lib/components/ui';
	import Icon from '@iconify/svelte';

	export let variant: ButtonVariant = 'filled';
	export let ref: HTMLElement | null = null;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let tabIndex: string = '0';
	export let disabled: boolean = false;
	export let color: SocialColor = 'blue';
	export let upper: boolean = false;
	export let size: SocialSize = 'md';
	export let radius: SocialRadius = 'rounded-md';
	export let classes: string = '';
	export let loading: boolean = false;
	export let startIcon: string | null = null;
	export let endIcon: string | null = null;
	export let id: string | null = null;
	export let fullWidth: boolean = false;

	$: buttonProps = {
		tabIndex,
		...$$restProps
	};
</script>

<button
	class={`${buttonVariantColorsMap[variant][color]} btn ${upper ? 'uppercase' : ''} btn-${size} ${radius} ${classes} ${fullWidth ? 'w-full' : ''}`}
	{type}
	bind:this={ref}
	on:click
	on:focus
	on:blur
	on:mouseover
	on:mouseenter
	on:mouseleave
	{disabled}
	{id}
	{...buttonProps}
>
	{#if startIcon}
		{#if loading}
			<Spin classes="mr-2" />
		{:else}
			<Icon icon={startIcon} class="mr-2 text-inherit" />
		{/if}
	{/if}
	<slot />
	{#if endIcon}
		{#if loading}
			<Spin classes="ml-2" />
		{:else}
			<Icon icon={endIcon} class="ml-2 text-inherit" />
		{/if}
	{/if}
</button>

<style lang="postcss">
	.btn {
		@apply cursor-pointer relative outline-none select-none appearance-none text-center flex justify-center items-center leading-none grow-0 font-semibold active:scale-[.988];
		-webkit-tap-highlight-color: transparent;
	}
	.btn:disabled,
	button:disabled {
		cursor: not-allowed !important;
		user-select: none !important;
		-webkit-user-select: none !important;
		-moz-user-select: none !important;
		-ms-user-select: none !important;
		-khtml-user-select: none !important;
		pointer-events: none !important;
		-webkit-touch-callout: none !important;
		@apply text-gray-400 bg-gray-200;
	}
	.btn-xs {
		@apply h-[30px] py-0 px-[14px] text-xs;
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
