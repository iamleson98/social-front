<script lang="ts">
	import type { SocialColor, SocialRadius, SocialSize } from '../common';
	import { buttonActiveStates, buttonVariantColorsMap, type ButtonVariant } from './button.types';
	// import { Spin } from '$lib/components/ui';

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
	export let id: string | null = null;
	export let fullWidth: boolean = false;

	/**
	 * if `true`, the button will be in active state
	 */
	export let active: boolean = false;

	const activeBg = active ? buttonActiveStates[color] : '';

	$: buttonProps = {
		tabIndex,
		...$$restProps
	};
</script>

<button
	class={`${activeBg} ${buttonVariantColorsMap[variant][color]} social-btn social-btn-${size} ${radius} ${classes}`}
	class:uppercase={upper}
	class:w-full={fullWidth}
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
	{#if loading}
		<span class="loading loading-dots loading-sm"></span>
	{:else}
		{#if $$slots.startIcon}
			<span class="mr-2 text-xl">
				<slot name="startIcon" />
			</span>
		{/if}
		<slot />
		{#if $$slots.endIcon}
			<span class="ml-2 text-xl">
				<slot name="endIcon" />
			</span>
		{/if}
	{/if}
</button>

<style lang="postcss">
	.social-btn {
		@apply cursor-pointer relative outline-none select-none appearance-none text-center flex justify-center items-center leading-none grow-0 font-semibold active:scale-[.98];
		-webkit-tap-highlight-color: transparent;
	}
	.social-btn:disabled,
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
