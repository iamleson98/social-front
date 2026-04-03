<script lang="ts">
	import type { SocialSize } from '$lib/components/ui/common';
	import type { SocialVariant } from '$lib/utils';
	import { INPUT_LABEL_SIZE_STYLE_MAP, INPUT_CLASSES } from './input.types';
	import type { Snippet } from 'svelte';

	type Props = {
		class?: string;
		required?: boolean | null;
		size?: SocialSize | 'xxs';
		id?: string | null;
		variant?: SocialVariant | 'ghost';
		label: Snippet | string;
		/** designate the position of the aterisk mark (*), relative with the label */
		requiredAtPos?: 'start' | 'end';
	};

	let {
		class: className = '',
		required = false,
		size = 'md',
		id,
		variant = 'info',
		label,
		requiredAtPos = 'start',
	}: Props = $props();
</script>

{#snippet Required()}
	<strong class="font-black text-red-600!"> * </strong>
{/snippet}

<label
	for={id}
	class={`block select-none font-medium mb-1 ${INPUT_LABEL_SIZE_STYLE_MAP[size]} ${className} ${INPUT_CLASSES[variant].fg}`}
>
	{#if required && requiredAtPos === 'start'}
		{@render Required()}
	{/if}

	{#if typeof label === 'string'}
		{label}
	{:else}
		{@render label()}
	{/if}

	{#if required && requiredAtPos === 'end'}
		{@render Required()}
	{/if}
</label>
