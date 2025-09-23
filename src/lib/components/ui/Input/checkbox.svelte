<script lang="ts">
	import type { SocialSize } from '$lib/components/ui/common';
	import type { SocialVariant } from '$lib/utils';
	import { randomID } from '$lib/utils/utils';
	import { CHECKBOX_SIZES, INPUT_CLASSES } from './input.types';
	import Label from './label.svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label?: Snippet | string;
		size?: SocialSize;
		subText?: string | Snippet;
		variant?: SocialVariant;
		onCheckChange?: (checked: boolean) => void;
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
		onCheckChange,
		...rest
	}: Props = $props();
</script>

<div class={`${className} ${INPUT_CLASSES[variant].fg} flex items-center`}>
	<div class={`inline-flex items-start gap-2`}>
		<input
			{...rest}
			{required}
			bind:checked
			type="checkbox"
			{id}
			class={`checkbox ${CHECKBOX_SIZES[size]} shadow-none!`}
			onchange={(evt) => {
				rest.onchange?.(evt);
				onCheckChange?.(evt.currentTarget.checked);
			}}
		/>
		<div>
			{#if label}
				<Label {id} {label} {required} {size} requiredAtPos="end" />
			{/if}
			{#if typeof subText === 'string'}
				<div class={`text-[10px] mt-0.5`}>{@html subText}</div>
			{:else}
				{@render subText?.()}
			{/if}
		</div>
	</div>
</div>
