<script lang="ts">
	import { randomID } from '$lib/utils/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label?: string;
	} & HTMLInputAttributes;

	let {
		label,
		checked = $bindable(),
		id = randomID(),
		class: className = '',
		required,
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
		class="checkbox"
	/>
	{#if label}
		<label for={id} class="ms-2 text-sm text-gray-900 dark:text-gray-300 select-none">
			{label}
			{#if required}<strong class="font-bold text-red-600!">*</strong>{/if}
		</label>
	{/if}
</div>
