<script lang="ts">
	import {
		buttonVariantColorsMap,
		ICON_OF_BUTTON_SIZE_MAP,
		type ButtonProps
	} from './button.types';
	import { Icon, type IconType } from '$lib/components/icons';
	import { debounceClick } from '$lib/actions/input-debounce';
	import { INPUT_BUTTON_SIZE_MAP } from './button.types';
	import type { ActionReturn } from 'svelte/action';

	type IconProps = {
		icon?: IconType;
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
		fullWidth = false,
		href,
		children,
		startIcon,
		endIcon,
		disabled,
		clickDebounceOptions,
		...restProps
	}: ButtonProps = $props();

	const bindAction = (node: HTMLButtonElement | HTMLAnchorElement): ActionReturn => {
		ref = node;
		return {
			destroy: () => {}
		};
	};

	let extraProps = $derived(href ? { href } : {});
</script>

{#snippet noopChildren()}
	<span></span>
{/snippet}

{#snippet buttonIcon({ icon }: IconProps)}
	{#if icon}
		<span class={`text-xl`}>
			<Icon {icon} class={ICON_OF_BUTTON_SIZE_MAP[size]} />
		</span>
	{/if}
{/snippet}

<svelte:element
	this={href ? 'a' : 'button'}
	class={`${buttonVariantColorsMap[variant][color]} button button-${size} ${INPUT_BUTTON_SIZE_MAP[size]} ${radius} ${className}`}
	class:uppercase={upper}
	class:w-full={fullWidth}
	{type}
	disabled={loading || disabled}
	use:bindAction
	use:debounceClick={clickDebounceOptions}
	{...restProps}
	{...extraProps}
>
	{#if loading}
		<span class="loading loading-dots loading-sm"></span>
	{:else}
		{@render buttonIcon({ icon: startIcon })}
		{#if children}
			{@render children()}
		{:else}
			{@render noopChildren()}
		{/if}
		{@render buttonIcon({ icon: endIcon })}
	{/if}
</svelte:element>

<style>
	@import 'tailwindcss/theme';
	.button {
		@apply cursor-pointer outline-hidden! !select-none gap-1.5 appearance-none text-center inline-flex justify-center items-center leading-none grow-0 font-medium focus:ring-4;
		-webkit-tap-highlight-color: transparent;
	}
	.button[disabled] {
		@apply !text-gray-500 !bg-gray-200 !cursor-not-allowed !pointer-events-none !touch-none !border-none;
	}
	.button-xs {
		@apply px-3;
	}
	.button-sm {
		@apply px-3;
	}
	.button-md {
		@apply px-5;
	}
	.button-lg {
		@apply px-5;
	}
	.button-xl {
		@apply px-6;
	}
</style>
