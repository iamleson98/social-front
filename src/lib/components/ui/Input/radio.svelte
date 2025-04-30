<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '../common';
	import { RADIO_SIZES } from './input.types';
	import Label from './label.svelte';

	type Props = {
		label?: string;
		group?: string | number | boolean;
		size?: SocialSize;
		class?: string;
	} & Omit<HTMLInputAttributes, 'size' | 'hidden'>;

	let {
		label,
		id = randomID(),
		group = $bindable<number | string | boolean>(),
		size = 'md',
		class: className = '',
		...rest
	}: Props = $props();
</script>

<div class="flex items-center gap-1.5 cursor-pointer dark:border-gray-700 {className}">
	<input {id} type="radio" bind:group class="radio {RADIO_SIZES[size]}" {...rest} />
	{#if label}
		<Label {label} {size} {id} required={rest.required} />
	{/if}
</div>
