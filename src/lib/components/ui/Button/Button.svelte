<script lang="ts">
	import { BUTTON_VARIANT_COLORS_MAP, type ButtonProps } from './button.types';
	import { Icon, type IconContent } from '$lib/components/icons';
	import { debounceClick } from '$lib/actions/input-debounce';
	import { INPUT_BUTTON_SIZE_MAP } from './button.types';
	import { classNames } from '$lib/utils/utils';

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

	let extraProps = $derived.by(() => {
		const res: Record<string, unknown> = {};

		if (href) {
			res.href = href;

			if (disabled !== undefined) {
				res['aria-disabled'] = disabled;
			}
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
			<Icon {icon} {size} />
		</span>
	{/if}
{/snippet}

<svelte:element
	this={href ? 'a' : 'button'}
	bind:this={ref}
	class={classNames(
		{
			uppercase: upper,
			'w-full': fullWidth,
			'!text-gray-500 !bg-gray-200 !cursor-not-allowed !pointer-events-none !touch-none':
				!!disabled || loading,
			[BUTTON_VARIANT_COLORS_MAP[variant][color]]: !disabled && !loading,
		},
		`button button-${size} ${className}`,
		INPUT_BUTTON_SIZE_MAP[size],
		radius,
	)}
	{type}
	use:debounceClick={clickDebounceOptions}
	{...restProps}
	{...extraProps}
>
	{#if loading}
		<div class="absolute inset-0 z-10 flex items-center justify-center">
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
		@apply cursor-pointer relative outline-hidden! !select-none gap-1.5 appearance-none text-center inline-flex justify-center items-center leading-none grow-0 font-medium focus:ring-4 transition-all ease-in-out duration-100;
		-webkit-tap-highlight-color: transparent;
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
