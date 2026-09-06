<script lang="ts">
	import { debounceClick } from '$lib/actions/input-debounce';
	import { Icon, type IconContent } from '$lib/components/icons';
	import { BUTTON_VARIANT_COLORS_MAP, type ButtonProps } from './button.types';
	import { INPUT_BUTTON_SIZE_MAP } from './button.types';

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
		radius = 'rounded-lg',
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
		<span class="inline-flex shrink-0 items-center justify-center">
			<Icon {icon} {size} />
		</span>
	{/if}
{/snippet}

<svelte:element
	this={href ? 'a' : 'button'}
	bind:this={ref}
	class={[
		'button',
		`button-${size}`,
		INPUT_BUTTON_SIZE_MAP[size],
		upper && 'uppercase',
		fullWidth && 'w-full',
		radius,
		(!!disabled || loading) && 'button-disabled',
		!disabled && !loading && BUTTON_VARIANT_COLORS_MAP[variant][color],
		className,
	]}
	{type}
	use:debounceClick={clickDebounceOptions}
	{...restProps}
	{...extraProps}
	aria-busy={loading || undefined}
	aria-label={restProps['aria-label'] || undefined}
>
	{#if loading}
		<span class="loading loading-dots loading-sm"></span>
	{:else}
		{@render buttonIcon({ icon: startIcon })}
		{@render children()}
		{@render buttonIcon({ icon: endIcon })}
	{/if}
</svelte:element>

<style lang="postcss">
	@reference "tailwindcss";

	.button {
		@apply cursor-pointer relative font-semibold select-none gap-2 appearance-none text-center
                        inline-flex justify-center items-center leading-none grow-0
                        transition-[transform,background-color,border-color,box-shadow,color,filter] duration-150 ease-out
                        active:scale-[0.98] motion-safe:active:duration-75;
		-webkit-tap-highlight-color: transparent;
	}

	.button:not(.button-disabled):hover {
		filter: brightness(0.97);
	}

	.button-xs {
		@apply px-3;
	}
	.button-sm {
		@apply px-3.5;
	}
	.button-md {
		@apply px-5;
	}
	.button-lg {
		@apply px-6;
	}
	.button-xl {
		@apply px-7;
	}

	.button-disabled {
		@apply !text-gray-400 !bg-gray-100 !border-transparent !cursor-not-allowed !pointer-events-none !touch-none !shadow-none;
	}
</style>
