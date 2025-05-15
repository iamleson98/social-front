<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { SocialSize } from '$lib/components/ui/common';
	import { TOGGLE_SIZES } from './input.types';
	import Label from './label.svelte';

	type Props = {
		label?: string;
		group?: string | number | boolean;
		size?: SocialSize;
	} & Omit<HTMLInputAttributes, 'size' | 'hidden'>;

	let {
		label,
		id = randomID(),
		group = $bindable<number | string | boolean>(),
		size = 'md',
		...rest
	}: Props = $props();
</script>

<div class="flex items-center gap-1.5 cursor-pointer dark:border-gray-700">
	<input {id} type="checkbox" bind:group class="toggle {TOGGLE_SIZES[size]}" {...rest} />
	{#if label}
		<Label {label} {size} required={rest.required} />
	{/if}
</div>
