<script lang="ts">
	import {
		buttonVariantColorsMap,
		ICON_OF_BUTTON_SIZE_MAP,
		type ButtonProps
	} from './button.types';
	import { Icon, type IconContent } from '$lib/components/icons';
	import { debounceClick } from '$lib/actions/input-debounce';
	import { INPUT_BUTTON_SIZE_MAP } from './button.types';
	import type { ActionReturn } from 'svelte/action';

	type IconProps = {
		icon?: IconContent;
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
		children = noopChildren,
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

	let extraProps = $derived.by(() => {
		const res: Record<string, unknown> = {};

		if (href) {
			res.href = href;

			if (disabled !== undefined) {
				res['aria-disabled'] = disabled;
			}
			return res;
		} else {
			res.disabled = disabled;
		}

		return res;
	});
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
	use:bindAction
	use:debounceClick={clickDebounceOptions}
	{...restProps}
	{...extraProps}
>
	{#if loading}
		<div class="absolute inset-0 z-500 flex items-center justify-center">
			<span class="loading loading-dots loading-sm"></span>
		</div>
	{/if}
	{@render buttonIcon({ icon: startIcon })}
	{@render children()}
	{@render buttonIcon({ icon: endIcon })}
</svelte:element>

<style lang="postcss">
	@reference "tailwindcss";

	.button {
		@apply cursor-pointer relative outline-hidden! !select-none gap-1.5 appearance-none text-center inline-flex justify-center items-center leading-none grow-0 font-medium focus:ring-4;
		-webkit-tap-highlight-color: transparent;
	}
	.button[disabled],
	.button[aria-disabled='true'] {
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
