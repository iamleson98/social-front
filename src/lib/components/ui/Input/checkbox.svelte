<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '../common';
	import { CHECKBOX_SIZES } from './input.types';
	import Label from './label.svelte';

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

<div class={`flex items-center gap-2 ${className}`}>
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
