<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '$lib/components/ui/common';
	import { INPUT_CLASSES, TOGGLE_SIZES } from './input.types';
	import Label from './label.svelte';
	import type { SocialVariant } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		label?: string | Snippet;
		size?: SocialSize;
		variant?: SocialVariant;
		subText?: string | Snippet;
		onCheckChange?: (checked: boolean) => void;
	} & Omit<HTMLInputAttributes, 'size' | 'hidden'>;

	let {
		label,
		id = randomID(),
		checked = $bindable<boolean>(),
		size = 'md',
		onCheckChange,
		required,
		variant = 'info',
		class: className = '',
		subText,
		...rest
	}: Props = $props();
</script>

<div class={`${className} ${INPUT_CLASSES[variant].fg}`}>
	<div class={`inline-flex items-start gap-2`}>
		<input
			{...rest}
			{required}
			bind:checked
			type="checkbox"
			{id}
			class={`toggle ${TOGGLE_SIZES[size]} shadow-none!`}
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
