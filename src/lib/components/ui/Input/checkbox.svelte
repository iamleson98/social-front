<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '$lib/components/ui/common';
	import { CHECKBOX_SIZES, INPUT_CLASSES } from './input.types';
	import Label from './label.svelte';
	import type { SocialVariant } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		label?: string;
		size?: SocialSize;
		subText?: string | Snippet;
		variant?: SocialVariant;
	} & Omit<HTMLInputAttributes, 'size'>;

	let {
		label,
		checked = $bindable(),
		id = randomID(),
		class: className = '',
		required,
		size = 'md',
		subText,
		variant = 'info',
		...rest
	}: Props = $props();
</script>

<div class={`${className} ${INPUT_CLASSES[variant].fg}`}>
	<div class={`flex items-center gap-2`}>
		<input
			{...rest}
			{required}
			bind:checked
			type="checkbox"
			{id}
			class={`checkbox ${CHECKBOX_SIZES[size]}`}
		/>
		{#if label}
			<Label {id} {label} {required} {size} requiredAtPos="end" />
		{/if}
	</div>
	{#if typeof subText === 'string'}
		<div class={`text-[10px] mt-0.5`}>{@html subText}</div>
	{:else}
		{@render subText?.()}
	{/if}
</div>
