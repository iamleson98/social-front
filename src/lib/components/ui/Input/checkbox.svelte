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
		class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
	/>
	{#if label}
		<label for={id} class="ms-2 text-sm text-gray-900 dark:text-gray-300 select-none">
			{label}
			{#if required}<strong class="font-bold text-red-600!">*</strong>{/if}
		</label>
	{/if}
</div>
