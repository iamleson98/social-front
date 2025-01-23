<script lang="ts">
	import { CloseX, Icon, type IconType } from '$lib/components/icons';
	import { buttonVariantColorsMap, type ButtonVariant } from '../Button/button.types';
	import type { SocialColor, SocialSize } from '../common';
	import { BADGE_SIZE_VARIANTS } from './types';

	type BadgeVariant = ButtonVariant;

	type Props = {
		color?: SocialColor;
		text: string | number;
		onDismiss?: () => void;
		class?: string;
		variant?: BadgeVariant;
		ref?: HTMLSpanElement;
		startIcon?: IconType;
		size?: SocialSize;
		rounded?: boolean;
	};

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
	}: Props = $props();

	const roundClass = rounded ? 'rounded-full!' : 'rounded-sm';
</script>

<span
	bind:this={ref}
	class={`inline-flex items-center select-none! gap-2 ${roundClass} ${BADGE_SIZE_VARIANTS[size].badge} font-medium badge-${size} ${className} ${buttonVariantColorsMap[variant][color]}`}
>
	{#if startIcon}
		<Icon icon={startIcon} />
	{/if}
	<span class="px-0.5">{text}</span>
	{#if onDismiss}
		<button class={`text-inherit ${roundClass} cursor-pointer ${BADGE_SIZE_VARIANTS[size].btn} bg-inherit`} onclick={onDismiss}>
			<Icon icon={CloseX} width="0.7rem" height="0.7rem" />
		</button>
	{/if}
</span>
