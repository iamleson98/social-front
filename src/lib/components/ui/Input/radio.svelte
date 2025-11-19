<script lang="ts">
	import type { SocialSize } from '$lib/components/ui/common';
	import type { SocialVariant } from '$lib/utils';
	import { randomID } from '$lib/utils/utils';
	import { INPUT_CLASSES, RADIO_SIZES } from './input.types';
	import Label from './label.svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label?: string | Snippet;
		group?: string | number | boolean;
		size?: SocialSize;
		class?: string;
		subText?: string;
		variant?: SocialVariant;
		/** to make your component interactive, in drag-drop supported places */
		['data-interactive']?: boolean;
	} & Omit<HTMLInputAttributes, 'size' | 'hidden'>;

	let {
		label,
		id = randomID(),
		group = $bindable<number | string | boolean>(),
		size = 'md',
		class: className = '',
		subText,
		variant = 'info',
		...rest
	}: Props = $props();
</script>

<div class="flex items-start gap-1.5 dark:border-gray-700 {className} {INPUT_CLASSES[variant].fg}">
	<input {id} type="radio" bind:group class="radio {RADIO_SIZES[size]} shadow-none!" {...rest} />
	<div>
		{#if label}
			<Label {label} {size} {id} required={rest.required} {variant} />
		{/if}
		{#if subText}
			<div class="text-[10px]">{subText}</div>
		{/if}
	</div>
</div>
