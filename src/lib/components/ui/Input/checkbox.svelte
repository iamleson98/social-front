<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '../common';
	import { CHECKBOX_SIZES, INPUT_LABEL_SIZE_STYLE_MAP } from './input.types';

	type Props = {
		label?: string;
		size?: SocialSize;
	} & Omit<HTMLInputAttributes, 'size'>;

	let {
		label,
		checked = $bindable(),
		id = randomID(),
		class: className = '',
		required,
		size = 'md',
		...rest
	}: Props = $props();
</script>

<div class={`flex items-center ${className}`}>
	<input
		{...rest}
		{required}
		bind:checked
		type="checkbox"
		{id}
		class={`checkbox ${CHECKBOX_SIZES[size]}`}
	/>
	{#if label}
		<label for={id} class={`ms-2 text-gray-900 dark:text-gray-300 select-none ${INPUT_LABEL_SIZE_STYLE_MAP[size]}`}>
			{label}
			{#if required}<strong class="font-bold text-red-600!">*</strong>{/if}
		</label>
	{/if}
</div>
