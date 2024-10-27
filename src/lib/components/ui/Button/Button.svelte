<script lang="ts" module>
	export type Props = {
		variant?: ButtonVariant;
		ref?: HTMLButtonElement;
		type?: 'button' | 'submit' | 'reset';
		color?: SocialColor;
		upper?: boolean;
		size?: SocialSize;
		radius?: SocialRadius;
		loading?: boolean;
		fullWidth?: boolean;
		children?: Snippet;
		startIcon?: IconType;
		endIcon?: IconType;
		clickDebounceOptions?: ClickDebounceOpts;
	} & HTMLButtonAttributes;
</script>

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { SocialColor, SocialRadius, SocialSize } from '../common';
	import { buttonVariantColorsMap, type ButtonVariant } from './button.types';
	import { type Snippet } from 'svelte';
	import { Icon, type IconType } from '$lib/components/icons';
	import { debounceClick, type ClickDebounceOpts } from '$lib/actions/input-debounce';
	import { SIZE_MAP } from '$lib/utils/consts';

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
		children = fakeChildren,
		startIcon,
		endIcon,
		disabled,
		clickDebounceOptions,
		...restProps
	}: Props = $props();
</script>

{#snippet fakeChildren()}
	<span></span>
{/snippet}

{#snippet buttonIcon({ icon }: IconProps)}
	{#if icon}
		<span class={`text-xl`}>
			<Icon {icon} />
		</span>
	{/if}
{/snippet}

<button
	class={`${buttonVariantColorsMap[variant][color]} button button-${size} ${SIZE_MAP[size]} ${radius} ${className}`}
	class:uppercase={upper}
	class:w-full={fullWidth}
	{type}
	disabled={loading || disabled}
	bind:this={ref}
	use:debounceClick={clickDebounceOptions}
	{...restProps}
>
	{#if loading}
		<span class="loading loading-dots loading-sm"></span>
	{:else}
		{@render buttonIcon({ icon: startIcon })}
		{@render children()}
		{@render buttonIcon({ icon: endIcon })}
	{/if}
</button>

<style lang="postcss">
	.button {
		@apply cursor-pointer !outline-none !select-none gap-1.5 appearance-none text-center inline-flex justify-center items-center leading-none grow-0 font-medium focus:ring-4;
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
