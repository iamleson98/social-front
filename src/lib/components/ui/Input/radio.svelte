<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '$lib/components/ui/common';
	import { INPUT_CLASSES, RADIO_SIZES } from './input.types';
	import Label from './label.svelte';
	import type { SocialVariant } from '$lib/utils';

	type Props = {
		label?: string;
		group?: string | number | boolean;
		size?: SocialSize;
		class?: string;
		subText?: string;
		variant?: SocialVariant;
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

<div
	class="flex items-start gap-1.5 cursor-pointer dark:border-gray-700 {className} {INPUT_CLASSES[
		variant
	].fg}"
>
	<input {id} type="radio" bind:group class="radio {RADIO_SIZES[size]}" {...rest} />
	<div>
		{#if label}
			<Label {label} {size} {id} required={rest.required} {variant} />
		{/if}
		{#if subText}
			<div class="text-[10px]">{subText}</div>
		{/if}
	</div>
</div>
