<script lang="ts">
	import { CloseX, Icon } from '$lib/components/icons';
	import { buttonVariantColorsMap, type ButtonVariant } from '../Button/button.types';
	import type { SocialColor } from '../common';

	type BadgeVariant = ButtonVariant;

	type Props = {
		color?: SocialColor;
		text: string;
		onDismiss?: () => void;
		class?: string;
		variant?: BadgeVariant;
		ref?: HTMLSpanElement;
	};

	let {
		variant = 'filled',
		text,
		onDismiss,
		class: className = '',
		color = 'blue',
		ref = $bindable()
	}: Props = $props();
</script>

<span
	bind:this={ref}
	class={`inline-flex items-center py-1 px-2 text-xs space-x-2 rounded-full ${className} ${buttonVariantColorsMap[variant][color]}`}
>
	<span>{text}</span>
	{#if onDismiss}
		<button class="text-inherit p-1 rounded-full bg-inherit" tabindex="0" onclick={onDismiss}>
			<Icon icon={CloseX} width="0.7rem" height="0.7rem" />
		</button>
	{/if}
</span>
