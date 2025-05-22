<script lang="ts">
	import { CloseX, Icon } from '$lib/components/icons';
	import { BUTTON_VARIANT_COLORS_MAP } from '$lib/components/ui/Button/button.types';
	import { BADGE_SIZE_VARIANTS, type BadgeProps } from './types';

	let {
		variant = 'filled',
		text,
		onDismiss,
		class: className = '',
		color = 'blue',
		ref = $bindable(),
		startIcon,
		size = 'sm',
		rounded = false,
		disabled = false,
		...restProps
	}: BadgeProps = $props();

	const roundClass = rounded ? 'rounded-full!' : 'rounded-sm';
</script>

<span
	bind:this={ref}
	class={`inline-flex items-center whitespace-nowrap select-none! gap-1 ${roundClass} ${BADGE_SIZE_VARIANTS[size].badge} font-medium badge-${size} ${className} ${BUTTON_VARIANT_COLORS_MAP[variant][color]}`}
	{...restProps}
>
	{#if startIcon}
		<Icon icon={startIcon} />
	{/if}
	<span class="px-0.5">{text}</span>
	{#if onDismiss}
		<button
			class={`text-inherit ${roundClass} cursor-pointer ${BADGE_SIZE_VARIANTS[size].btn} bg-inherit`}
			onclick={() => !disabled && onDismiss()}
		>
			<Icon icon={CloseX} {size} />
		</button>
	{/if}
</span>
